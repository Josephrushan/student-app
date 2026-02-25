// components/NotificationSubscribeButton.tsx
import React, { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { useNotificationSubscription } from '../hooks/useNotificationSubscription';
import { getAuth } from 'firebase/auth';

interface NotificationSubscribeButtonProps {
  userId?: string;
}

export const NotificationSubscribeButton: React.FC<NotificationSubscribeButtonProps> = ({ userId }) => {
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  
  // Get the Firebase UID (not the custom user ID)
  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser?.uid) {
      setFirebaseUid(auth.currentUser.uid);
      console.log('🔐 Using Firebase UID for notifications:', auth.currentUser.uid);
    }
  }, []);
  
  const { isSubscribed, isLoading, error, subscribe, unsubscribe } = useNotificationSubscription({ userId: firebaseUid || undefined });

  const handleClick = async () => {
    try {
      if (!firebaseUid) {
        toast.error('User not authenticated. Please refresh and try again.');
        return;
      }
      
      if (isSubscribed) {
        await unsubscribe();
        toast.success('Notifications disabled');
      } else {
        console.log('🔔 Subscribing with firebaseUid:', firebaseUid);
        await subscribe();
        toast.success('Notifications enabled! You\'ll now receive alerts.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      
      // Provide specific guidance for common issues
      if (errorMsg.includes('denied') || errorMsg.includes('browser settings')) {
        toast.error('Notifications blocked. Go to browser settings → Privacy & security → Notifications and reset permissions for this site.');
      } else if (errorMsg.includes('VAPID') || errorMsg.includes('configured')) {
        toast.error('Server configuration issue. Please contact support.');
      } else {
        toast.error(`Failed to enable notifications: ${errorMsg}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isLoading || !firebaseUid}
        className={`flex items-center gap-2 px-4 py-2 rounded-3xl font-medium transition-colors bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isSubscribed ? (
          <>
            <BellOff size={20} />
            Unsubscribe from Notifications
          </>
        ) : (
          <>
            <Bell size={20} />
            Enable Notifications
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}
    </div>
  );
};
