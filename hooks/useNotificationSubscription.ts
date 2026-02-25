// hooks/useNotificationSubscription.ts
import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  unsubscribeFromNotifications,
  checkNotificationSubscription,
} from '../services/notificationService';
import { savePushSubscription, removePushSubscription, getUserPushSubscriptions } from '../services/firebaseService';

interface UseNotificationSubscriptionOptions {
  userId?: string;
}

export const useNotificationSubscription = (options?: UseNotificationSubscriptionOptions) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check initial subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        const subscription = await checkNotificationSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check subscription status');
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []);

  const subscribe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔔 Starting subscription process...');
      const subscription = await requestNotificationPermission();
      if (subscription) {
        console.log('💾 Saving subscription to Firebase...');
        
        // Save to Firebase if userId is provided
        if (options?.userId) {
          try {
            await savePushSubscription(options.userId, subscription);
            console.log('✅ Subscription saved to Firebase');
          } catch (firebaseError) {
            console.error('⚠️ Failed to save to Firebase:', firebaseError);
            // Still mark as subscribed even if Firebase save fails
          }
        } else {
          console.warn('⚠️ No userId provided - subscription not saved to backend');
        }
        
        setIsSubscribed(true);
        console.log('✅ Subscription successful');
      } else {
        console.log('⚠️ Subscription returned null');
        setError('Failed to subscribe - check browser console for details');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to subscribe';
      console.error('❌ Subscribe error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [options?.userId]);

  const unsubscribe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await unsubscribeFromNotifications();
      if (success) {
        setIsSubscribed(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
};
