'use client';

import { NextPushProvider } from 'next-push/client';
import { Toaster } from 'sonner';
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { 
  BookOpen, 
  MessageCircle, 
  GraduationCap, 
  Menu, 
  X, 
  LogOut, 
  Camera, 
  Bell, 
  Book, 
  User as UserIcon, 
  ChevronRight,
  Users,
  Shield,
  Calendar,
  Scale,
  Building2,
  Inbox,
  Gamepad2
} from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onGradeChange: (grade: string) => void;
  hasUnreadChat?: boolean;
  hasUnreadJournal?: boolean;
  hasUnreadHomework?: boolean;
  hasUnreadAlerts?: boolean;
  hasUnreadInbox?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onLogout,
  hasUnreadChat = false,
  hasUnreadJournal = false,
  hasUnreadHomework = false,
  hasUnreadAlerts = false,
  hasUnreadInbox = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mainNavItems: NavItem[] = [
    { id: 'homework', label: 'Homework', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'community', label: 'Chat', icon: MessageCircle },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'journal', label: 'Journal', icon: Camera },
  ];

  const secondaryNavItems: NavItem[] = [
    { id: currentUser.role === UserRole.PARENT ? 'parent-notifications' : 'alerts', label: 'Alerts', icon: Bell },
    { id: 'quizzes', label: 'Quizzes', icon: GraduationCap },
    { id: 'yearbook', label: 'Yearbook', icon: Book },
    { id: 'tutoring', label: 'Library', icon: GraduationCap },
    { id: 'directory', label: 'Directory', icon: Users },
  ];

  const bottomNavItems: NavItem[] = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'conduct', label: 'Code of Conduct', icon: Scale },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  const renderMenuItem = (item: NavItem) => {
    const isActive = activeTab === item.id;
    const isAlertItem = item.id === 'alerts' || item.id === 'parent-notifications';
    const isUnread = 
      (item.id === 'community' && hasUnreadChat) || 
      (item.id === 'journal' && hasUnreadJournal) ||
      (item.id === 'homework' && hasUnreadHomework) ||
      (item.id === 'inbox' && hasUnreadInbox) ||
      (isAlertItem && hasUnreadAlerts);

    return (
      <button 
        key={item.id} 
        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
        className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all duration-300 relative group ${
            isActive ? 'bg-[#072432] text-[#00ff8e] shadow-xl' : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-5 text-left">
           <div className="relative">
             <item.icon className={`w-6 h-6 ${isActive ? 'text-[#00ff8e]' : 'text-slate-400 group-hover:text-slate-600'}`} />
             {isUnread && (
               <span className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                 isAlertItem ? 'bg-red-500 animate-pulse ring-4 ring-red-500/20' : 'bg-[#00ff8e]'
               }`}></span>
             )}
           </div>
           <span className={`text-lg font-semibold uppercase tracking-widest ${isActive ? 'text-[#00ff8e]' : 'text-slate-700'}`}>{item.label}</span>
        </div>
        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#00ff8e]' : 'text-slate-200'}`} />
      </button>
    );
  };

  return (
    <NextPushProvider>
      <div className="fixed inset-0 flex flex-col bg-[#f8fafc] overflow-hidden">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50 pt-safe flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 md:h-16 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4 flex-1">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 text-slate-400 transition-colors active:scale-90">
                    {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
                <div className="h-6 w-[1px] bg-slate-100 mx-1"></div>
                <div className="flex items-center justify-center p-0.5 bg-white rounded-full border border-slate-100 shadow-sm w-10 h-10 overflow-hidden shrink-0">
                  {currentUser.schoolLogo ? (
                    <img src={currentUser.schoolLogo} alt="School" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-300" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <Logo size="sm" />
              </div>

              <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">
                <div className="relative cursor-pointer group" onClick={() => setActiveTab('profile')}>
                  <img 
                      src={currentUser.avatar} 
                      alt="User" 
                      className="h-10 w-10 md:h-9 md:w-9 rounded-full object-cover bg-slate-50 border-2 border-slate-100 shadow-sm group-hover:border-[#00ff8e] transition-all"
                  />
                </div>
                <div className="h-6 w-[1px] bg-slate-100 mx-1"></div>
                <button onClick={onLogout} className="p-3 text-slate-400 hover:text-red-500 transition-colors active:scale-90">
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
          </div>

          {isMobileMenuOpen && (
              <div className="fixed inset-0 top-0 bg-slate-900/60 backdrop-blur-md z-[60] animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="absolute top-0 left-0 w-80 h-full bg-white shadow-2xl animate-slide-in-left flex flex-col overflow-hidden pt-safe" onClick={e => e.stopPropagation()}>
                      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                           <Logo size="sm" />
                           <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-slate-400"><X className="w-6 h-6" /></button>
                      </div>
                      
                      <div className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar pb-40 text-left">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-6 mb-4 px-4">Main Experience</p>
                           {mainNavItems.map(renderMenuItem)}
                           <div className="h-px bg-slate-100 my-6"></div>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-4">Curriculum & Data</p>
                           {secondaryNavItems.map(renderMenuItem)}
                           <div className="h-px bg-slate-100 my-6"></div>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-4">Account & Policy</p>
                           {bottomNavItems.map(renderMenuItem)}
                           <div className="px-4 pt-12">
                              <button onClick={onLogout} className="w-full flex items-center justify-center gap-4 p-6 rounded-[2.5rem] text-slate-500 bg-slate-100 transition-all font-black uppercase tracking-[0.3em] text-[11px] hover:bg-slate-200 active:scale-95">
                                  <LogOut className="w-5 h-5" /> LOGOUT
                              </button>
                           </div>
                      </div>
                  </div>
              </div>
          )}
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 pb-32 overflow-y-auto overflow-x-hidden">
          {children}
        </main>

        <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-2xl border-t border-slate-100 z-[50] pb-safe shadow-[0_-15px_40px_rgba(0,0,0,0.06)] flex-shrink-0">
          <div className="flex justify-around items-center h-20 max-w-5xl mx-auto px-2">
              {mainNavItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const isAlertItem = item.id === 'alerts' || item.id === 'parent-notifications';
                  const isUnread = 
                    (item.id === 'community' && hasUnreadChat) || 
                    (item.id === 'journal' && hasUnreadJournal) ||
                    (item.id === 'homework' && hasUnreadHomework) ||
                    (item.id === 'inbox' && hasUnreadInbox) ||
                    (isAlertItem && hasUnreadAlerts);

                  return (
                      <button key={item.id} onClick={() => setActiveTab(item.id)} className="flex flex-col items-center justify-center w-full h-full relative group">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-[#072432] text-[#00ff8e] shadow-xl scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
                              <item.icon className="w-6 h-6" />
                          </div>
                          {isUnread && (
                            <span className={`absolute top-3 right-[22%] w-3 h-3 rounded-full border-2 border-white shadow-md ${
                              isAlertItem ? 'bg-red-500 animate-pulse' : 'bg-[#00ff8e]'
                            }`}></span>
                          )}
                          <span className={`text-[8px] mt-1 font-black uppercase tracking-widest transition-all ${isActive ? 'text-[#072432] opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>{item.label}</span>
                      </button>
                  );
              })}
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" richColors style={{ marginBottom: '90px' }} />
    </NextPushProvider>
  );
};

export default Layout;
