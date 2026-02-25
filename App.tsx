import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import HomeworkModule from './components/HomeworkModule';
import ChatModuleDummy from './components/ChatModuleDummy';
import InboxModuleDummy from './components/InboxModuleDummy';
import TutoringModule from './components/TutoringModule';
import QuizzesModule from './components/QuizzesModule';
import YearbookModule from './components/YearbookModule'; 
import DigitalYearbook from './components/DigitalYearbook'; 
import AnnouncementsModule from './components/AnnouncementsModule';
import AlertsModule from './components/AlertsModule';
import NotificationsModule from './components/NotificationsModule';
import ProfileModule from './components/ProfileModule';
import DirectoryModule from './components/DirectoryModule';
import PrivacyPolicyModule from './components/PrivacyPolicyModule';
import HowItWorksModule from './components/HowItWorksModule';
import CodeOfConductModule from './components/CodeOfConductModule';
import CalendarModule from './components/CalendarModule';
import AdminDashboard from './components/AdminDashboard';
import { INITIAL_YEARBOOK_CONFIG } from './constants';
import { UserRole, User, ChatMessage, Assignment, Resource, YearbookEntry, Announcement, YearbookConfig, Alert, CalendarEvent, Conversation } from './types';
import { db, setupListener, saveDoc, getDoc, auth, removeDoc, signInWithEmailAndPassword } from './services/firebaseService';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { Bell, X, ShieldAlert, Thermometer, UserX } from 'lucide-react';
import { NextPushProvider } from 'next-push/client';
import { onAuthStateChanged, signOut } from './services/firebaseService';

// Hardcoded test user (permanently logged in)
const TEST_USER: User = {
  id: 'chAsRCQ0CUPdmghW0d5Acbsad922',
  name: 'Liam',
  surname: 'Smith',
  email: 'liam@gmail.com',
  password: 'Imsocool123',
  role: UserRole.STUDENT,
  grade: 'Grade 8',
  avatar: '',
  school: 'Test High school',
  schoolId: 'school_1767719181915',
  schoolLogo: 'https://firebasestorage.googleapis.com/v0/b/websitey-9f8e4.firebasestorage.app/o/schools%2Fschool_1767719181915%2Flogo?alt=media&token=a928d5dc-46a8-46c4-877a-e1f70bbd84a2',
  isPaid: false,
  isGlobalResourceCreator: false,
  contactNumber: '0603253336',
  coverImage: '',
  funFact: ''
};

const SplashScreen = ({ onFinished, isLoggedIn }: { onFinished: () => void; isLoggedIn: boolean }) => {
  const [loaded, setLoaded] = useState(false);
  const gifUrl = "https://firebasestorage.googleapis.com/v0/b/websitey-9f8e4.firebasestorage.app/o/educater.gif?alt=media&token=9176e9e2-8b3f-48cd-b5ae-a57d52e33182";
  const iconUrl = "https://firebasestorage.googleapis.com/v0/b/websitey-9f8e4.firebasestorage.app/o/appicon2.png?alt=media&token=e36545a8-38ab-49d6-ad7a-b313cfbfc285";

  useEffect(() => {
    if (isLoggedIn) {
      // Quick loading indicator for logged-in users: show for ~3 seconds
      const timer = setTimeout(onFinished, 3000);
      return () => clearTimeout(timer);
    } else {
      // Full splash screen for logged-out users
      if (loaded) {
        const timer = setTimeout(onFinished, 4500);
        return () => clearTimeout(timer);
      }
    }
  }, [onFinished, loaded, isLoggedIn]);

  if (isLoggedIn) {
    // Quick loading indicator: just icon on blue background
    return (
      <div className="fixed inset-0 bg-[#002135] z-[9999] flex flex-col items-center justify-center overflow-hidden">
        <img 
          src={iconUrl} 
          alt="Loading..." 
          className="w-16 h-16 md:w-24 md:h-24 object-contain rounded-3xl"
        />
      </div>
    );
  }

  // Full splash screen with gif for non-authenticated users
  return (
    <div className="fixed inset-0 bg-[#002135] z-[9999] flex flex-col items-center justify-center overflow-hidden">
       <div className={`relative z-10 flex flex-col items-center justify-center transition-transform duration-700 ${loaded ? 'scale-100' : 'scale-95'}`}>
          <img 
            src={gifUrl} 
            alt="Loading..." 
            className={`w-[280px] md:w-[400px] h-auto object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
          />
       </div>
    </div>
  );
};

const EmergencyAlertModal = ({ alert, onClose }: { alert: Alert, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[999] bg-[#072432]/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(255,0,0,0.2)] animate-scale-up border-4 border-red-50">
        <div className="bg-red-500 p-8 text-white flex items-center justify-between">
           <div className="flex items-center gap-4">
             <ShieldAlert className="w-10 h-10 animate-pulse" />
             <h2 className="text-3xl font-black uppercase tracking-tighter">Emergency Alert</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-10 text-center">
           <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-red-500 shadow-inner">
              {alert.type === 'Absent' ? <UserX className="w-12 h-12" /> : <Thermometer className="w-12 h-12" />}
           </div>
           <h3 className="text-2xl font-black text-slate-900 mb-2">{alert.studentName}</h3>
           <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
             An urgent <span className="font-black text-red-600 uppercase">{alert.type}</span> status has been logged by {alert.teacherName}. Please check the portal immediately.
           </p>
           <button 
             onClick={onClose}
             className="w-full py-6 bg-[#072432] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
           >
             Acknowledge & Close
           </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  // Hardcoded - always authenticated with test user
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(TEST_USER);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [yearbookEntries, setYearbookEntries] = useState<YearbookEntry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [yearbookConfig, setYearbookConfig] = useState<YearbookConfig>(INITIAL_YEARBOOK_CONFIG);
  const [schoolLogo, setSchoolLogo] = useState<string | undefined>(currentUser?.schoolLogo);

  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('hc_active_tab') || 'journal';
  });

  // Wrapper function that also saves to localStorage
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    localStorage.setItem('hc_active_tab', tab);
  };
  const [activeConversationIdState, setActiveConversationIdState] = useState<string | null>(() => {
    return localStorage.getItem('hc_active_conversation_id');
  });

  // Wrapper function that also saves to localStorage
  const setActiveConversationId = (id: string | null) => {
    setActiveConversationIdState(id);
    if (id) {
      localStorage.setItem('hc_active_conversation_id', id);
    } else {
      localStorage.removeItem('hc_active_conversation_id');
    }
  };
  const [directorySearch, setDirectorySearch] = useState('');
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const [hasUnreadJournal, setHasUnreadJournal] = useState(false);
  const [hasUnreadHomework, setHasUnreadHomework] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);
  const [hasUnreadInbox, setHasUnreadInbox] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<Alert | null>(null);
  
  const isSuperAdmin = currentUser?.email === 'info@visualmotion.co.za';

  // Change status bar color from blue (splash) to white (app content) when splash hides
  useEffect(() => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!showSplash && themeColorMeta) {
      // Splash is hidden - change to white for the app
      themeColorMeta.setAttribute('content', '#ffffff');
    } else if (showSplash && themeColorMeta) {
      // Splash is showing - keep it blue
      themeColorMeta.setAttribute('content', '#002135');
    }
  }, [showSplash]);

  // Auto-hide splash screen for logged-in users after 3 seconds
  useEffect(() => {
    if (showSplash && isAuthenticated) {
      const timer = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSplash, isAuthenticated]);

  // Safety timeout: Force hide splash screen after 8 seconds maximum (for no-data mode or slow auth)
  useEffect(() => {
    if (showSplash) {
      const safetyTimer = setTimeout(() => {
        console.log('Safety timeout: Force hiding splash screen');
        setShowSplash(false);
      }, 8000);
      return () => clearTimeout(safetyTimer);
    }
  }, [showSplash]);

  // Auto-authenticate test user with Firebase Auth on startup
  useEffect(() => {
    if (!currentUser) return;

    const authenticateTestUser = async () => {
      try {
        // Sign in with Firebase Auth using the test user credentials
        await signInWithEmailAndPassword(auth, currentUser.email || 'liam@gmail.com', currentUser.password || 'Imsocool123');
        console.log('✅ Test user authenticated with Firebase Auth');
      } catch (err: any) {
        console.warn('⚠️ Firebase Auth signin failed (may already be signed in):', err.message);
        // If already signed in, just continue
      }
    };

    authenticateTestUser();
  }, []);

  // Check Firebase auth state on app load (persistent login)
  // For hardcoded test user, skip Firebase auth and just set up push notifications
  useEffect(() => {
    if (!currentUser) return;

    // Auto-subscribe to push notifications if browser supports it
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        navigator.serviceWorker.ready.then(async (registration) => {
          const subscription = await registration.pushManager.getSubscription();
          
          // If no active subscription, request one
          if (!subscription) {
            console.log('🔔 No active subscription found - requesting new one...');
            const permission = Notification.permission;
            
            if (permission === 'granted') {
              // Permission already granted, subscribe automatically
              const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY;
              if (vapidPublicKey) {
                const newSub = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: new Uint8Array(
                    atob(vapidPublicKey).split('').map(c => c.charCodeAt(0))
                  )
                });
                
                // Save subscription to Firebase
                const { savePushSubscription } = await import('./services/firebaseService');
                await savePushSubscription(currentUser.id, newSub);
                console.log('✅ Auto-subscription successful on login');
              }
            }
          }
        });
      } catch (err) {
        console.warn('⚠️ Auto-subscription failed (non-critical):', err);
      }
    }
  }, [currentUser?.id]);

  // Listen for messages from service worker (e.g., to clear badge)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'CLEAR_BADGE') {
          if (navigator.setAppBadge) {
            navigator.setAppBadge(0).catch(() => {});
          }
        }
      };
      
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    if (activeTab === 'community') {
      setHasUnreadChat(false);
      localStorage.setItem('hc_last_chat_read', now.toString());
    }
    if (activeTab === 'journal') {
      setHasUnreadJournal(false);
      localStorage.setItem('hc_last_journal_read', now.toString());
    }
    if (activeTab === 'homework') {
      setHasUnreadHomework(false);
      localStorage.setItem('hc_last_hw_read', now.toString());
    }
    if (activeTab === 'alerts' || activeTab === 'parent-notifications') {
      setHasUnreadAlerts(false);
      localStorage.setItem('hc_last_alert_read', now.toString());
    }
    if (activeTab === 'inbox') {
      setHasUnreadInbox(false);
      localStorage.setItem('hc_last_inbox_read', now.toString());
    }
  }, [activeTab]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser || isSuperAdmin) return;
    
    const sid = currentUser.schoolId;
    if (!sid) return;

    const unsubSchool = onSnapshot(doc(db, 'schools', sid), (snap) => {
        if (snap.exists()) {
            setSchoolLogo(snap.data().logoUrl);
        }
    }, (err) => {
      console.warn('Failed to load school data:', err);
    });

    const unsubUsers = setupListener('users', (data) => setAllUsers(data as User[]), undefined, 'desc', sid);
    
    const unsubAssignments = setupListener('assignments', (data) => {
        const sorted = (data as Assignment[]).sort((a, b) => b.timestamp - a.timestamp);
        setAssignments(sorted);
        if (activeTab !== 'homework' && sorted.length > 0) {
            const lastRead = Number(localStorage.getItem('hc_last_hw_read') || 0);
            const hasNew = sorted.some(a => a.timestamp && (a.timestamp > lastRead));
            if (hasNew) setHasUnreadHomework(true);
        }
    }, undefined, 'asc', sid);

    const unsubMessages = setupListener('messages', (data) => {
        const sorted = (data as ChatMessage[]).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(sorted);
        if (activeTab !== 'community' && sorted.length > 0) {
            const lastRead = Number(localStorage.getItem('hc_last_chat_read') || 0);
            const newest = sorted[sorted.length - 1].timestamp;
            if (newest > lastRead) setHasUnreadChat(true);
        }
    }, undefined, 'asc', sid);

    // Inbox Listener: Conversations where current user is a participant
    const qConversations = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.id),
      where('schoolId', '==', sid)
    );
    const unsubInbox = onSnapshot(qConversations, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      const sorted = data.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
      setConversations(sorted);
      if (activeTab !== 'inbox' && sorted.length > 0) {
        const lastRead = Number(localStorage.getItem('hc_last_inbox_read') || 0);
        const newest = sorted[0].lastTimestamp;
        if (newest > lastRead) setHasUnreadInbox(true);
      }
    }, (err) => {
      console.warn("Conversations listener failed (Permissions/Index):", err);
      // Set empty conversations on permission denied
      setConversations([]);
    });

    const unsubResources = setupListener('resources', (data) => setResources(data as Resource[]), undefined, 'desc', sid);
    
    const unsubYearbook = setupListener('yearbook', (data) => {
        const sorted = (data as YearbookEntry[]).sort((a, b) => b.timestamp - a.timestamp);
        setYearbookEntries(sorted);
        if (activeTab !== 'journal' && sorted.length > 0) {
            const lastRead = Number(localStorage.getItem('hc_last_journal_read') || 0);
            const newest = sorted[0].timestamp;
            if (newest > lastRead) setHasUnreadJournal(true);
        }
    }, undefined, 'desc', sid);

    // FIX: Only staff (Teacher/Principal) should listen to staff announcements
    let unsubAnnouncements: (() => void) | undefined;
    if (currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL) {
        unsubAnnouncements = setupListener('announcements', (data) => {
            const sorted = (data as Announcement[]).sort((a, b) => b.date.localeCompare(a.date) * -1);
            setAnnouncements(sorted);
        }, undefined, 'desc', sid);
    }

    const unsubEvents = setupListener('events', (data) => {
        const sorted = (data as CalendarEvent[]).sort((a, b) => a.date.localeCompare(b.date));
        setEvents(sorted);
    }, undefined, 'asc', sid);

    const unsubAlerts = setupListener('alerts', (data) => {
      const activeAlerts = (data as Alert[]).filter(a => !a.resolved);
      setAlerts(data as Alert[]);
      if (activeAlerts.length > 0) {
          const lastRead = Number(localStorage.getItem('hc_last_alert_read') || 0);
          const myStudentIds = allUsers.filter(u => u.parentId === currentUser.id).map(u => u.id);
          const newAlertsForMe = activeAlerts.filter(a => {
            const isRelevant = currentUser.role === UserRole.PARENT ? myStudentIds.includes(a.studentId) : true;
            return isRelevant && a.timestamp > lastRead;
          });
          if (newAlertsForMe.length > 0) {
            setHasUnreadAlerts(true);
            if (currentUser.role === UserRole.PARENT && !emergencyAlert) {
              setEmergencyAlert(newAlertsForMe[0]);
            }
          }
      }
    }, undefined, 'desc', sid);

    const unsubConfig = onSnapshot(doc(db, `schools/${sid}/config`, 'yearbook_settings'), (snap) => {
      if (snap.exists()) setYearbookConfig(snap.data() as YearbookConfig);
    }, (err) => {
      console.warn('Failed to load yearbook config:', err);
    });

    return () => {
      unsubSchool(); unsubUsers(); unsubAssignments(); unsubMessages(); unsubResources();
      unsubYearbook(); if (unsubAnnouncements) unsubAnnouncements(); unsubAlerts(); unsubEvents(); unsubConfig(); unsubInbox();
    };
  }, [isAuthenticated, currentUser?.id, currentUser?.role, currentUser?.schoolId, activeTab, isSuperAdmin, allUsers.length]);

  // Auto-delete assignments that have been hidden for 24+ hours (per user)
  useEffect(() => {
    if (!assignments || assignments.length === 0 || !currentUser?.id) return;

    const checkAndDelete = async () => {
      const now = Date.now();
      const toDelete = assignments.filter(a => {
        const userCompletion = a.completions?.[currentUser.id];
        if (!userCompletion?.hideUntil) return false;
        return now >= userCompletion.hideUntil;
      });

      for (const assignment of toDelete) {
        try {
          console.log('Auto-deleting expired assignment:', assignment.id);
          await removeDoc('assignments', assignment.id);
        } catch (err) {
          console.error('Failed to auto-delete assignment:', err);
        }
      }
    };

    checkAndDelete();

    // Check every 5 minutes for expired assignments
    const interval = setInterval(checkAndDelete, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [assignments]);

  const handleLogin = (user: User) => {
    // Check if user's subscription is still valid
    if ((user.role === UserRole.PARENT || user.role === UserRole.STUDENT) && !user.isPaid) {
      // Log them out immediately
      console.log('Subscription expired for user:', user.id);
      handleLogout();
      return;
    }
    setCurrentUser(user);
    setSchoolLogo(user.schoolLogo);
    setIsAuthenticated(true);
    localStorage.setItem('hc_auth_status', 'true');
    localStorage.setItem('hc_user', JSON.stringify(user));
  };

  const handleUpdateProfile = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      localStorage.setItem('hc_user', JSON.stringify(updatedUser));
      saveDoc('users', updatedUser.id, updatedUser);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
    
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSchoolLogo(undefined);
    setActiveTab('journal');
    localStorage.clear();
  };

  const handleMessageUser = async (targetUserId: string) => {
    if (!currentUser) return;
    const targetUser = allUsers.find(u => u.id === targetUserId);
    if (!targetUser) {
        console.warn("Target user not found in local state.");
        return;
    }

    const convId = [currentUser.id, targetUserId].sort().join('_');
    
    try {
      const convSnap = await getDoc(doc(db, 'conversations', convId));
      
      if (!convSnap.exists()) {
        const newConv: Conversation = {
          id: convId,
          participants: [currentUser.id, targetUserId],
          participantNames: {
            [currentUser.id]: currentUser.name,
            [targetUserId]: targetUser.name
          },
          participantAvatars: {
            [currentUser.id]: currentUser.avatar,
            [targetUserId]: targetUser.avatar
          },
          lastMessage: '',
          lastTimestamp: Date.now(),
          schoolId: currentUser.schoolId || ''
        };
        await saveDoc('conversations', convId, newConv);
      }

      setActiveConversationId(convId);
      setActiveTab('inbox');
    } catch (err) {
      console.error("Conversation initialization failed:", err);
      // Fallback: If doc read failed, attempt to just set active tab to Inbox
      setActiveTab('inbox');
    }
  };

  if (showSplash) return <SplashScreen onFinished={() => setShowSplash(false)} isLoggedIn={isAuthenticated} />;
  
  // Always authenticated with hardcoded test user
  if (!currentUser) return null;

  if (isSuperAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <NextPushProvider>
      <>
        {emergencyAlert && <EmergencyAlertModal alert={emergencyAlert} onClose={() => setEmergencyAlert(null)} />}
        <Layout 
          currentUser={{ ...currentUser, schoolLogo }} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onGradeChange={(grade) => {
              const updated = { ...currentUser, grade };
              setCurrentUser(updated);
              saveDoc('users', currentUser.id, updated);
          }}
          hasUnreadChat={hasUnreadChat}
          hasUnreadJournal={hasUnreadJournal}
          hasUnreadHomework={hasUnreadHomework}
          hasUnreadAlerts={hasUnreadAlerts}
          hasUnreadInbox={hasUnreadInbox}
        >
          {activeTab === 'homework' && <HomeworkModule currentUser={currentUser} assignments={assignments} setAssignments={setAssignments} allUsers={allUsers} />}
          {activeTab === 'community' && <ChatModuleDummy currentUser={currentUser} />}
          {activeTab === 'inbox' && <InboxModuleDummy currentUser={currentUser} />}
          {activeTab === 'tutoring' && <TutoringModule currentUser={currentUser} resources={resources} setResources={setResources} />}
          {activeTab === 'quizzes' && <QuizzesModule currentUser={currentUser} />}
          {activeTab === 'journal' && <YearbookModule currentUser={currentUser} entries={yearbookEntries} setEntries={setYearbookEntries} />}
          {activeTab === 'yearbook' && <DigitalYearbook currentUser={currentUser} entries={yearbookEntries} allUsers={allUsers} config={yearbookConfig} onConfigChange={setYearbookConfig} />}
          {activeTab === 'directory' && <DirectoryModule currentUser={currentUser} allUsers={allUsers} initialSearch={directorySearch} onSearchChange={setDirectorySearch} onMessageUser={handleMessageUser} />}
          {activeTab === 'calendar' && <CalendarModule currentUser={currentUser} events={events} setEvents={setEvents} />}
          {activeTab === 'conduct' && <CodeOfConductModule currentUser={currentUser} />}
          {activeTab === 'announcements' && <AnnouncementsModule currentUser={currentUser} announcements={announcements} setAnnouncements={setAnnouncements} allUsers={allUsers} />}
          {activeTab === 'alerts' && <AlertsModule currentUser={currentUser} allUsers={allUsers} alerts={alerts} setAlerts={setAlerts} />}
          {activeTab === 'profile' && <ProfileModule currentUser={currentUser} allUsers={allUsers} onUpdateProfile={handleUpdateProfile} onAddStudent={(s) => saveDoc('users', s.id, s)} alerts={alerts} setAlerts={setAlerts} onGradeChange={(g) => handleUpdateProfile({...currentUser, grade: g})} />}
          {activeTab === 'parent-notifications' && <NotificationsModule currentUser={currentUser} alerts={alerts} setAlerts={setAlerts} allUsers={allUsers} />}
          {activeTab === 'privacy' && <PrivacyPolicyModule />}
          {activeTab === 'guide' && <HowItWorksModule currentUser={currentUser} />}
        </Layout>
      </>
    </NextPushProvider>
  );
};

export default App;