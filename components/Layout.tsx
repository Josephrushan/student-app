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
  Gamepad2,
  Search
} from 'lucide-react';
import Logo from './Logo';
import ShortcutsModal from './ShortcutsModal';

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
  onCreateHomework?: () => void;
  onCreateJournal?: () => void;
  onCreateResource?: () => void;
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
  hasUnreadInbox = false,
  onCreateHomework,
  onCreateJournal,
  onCreateResource
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

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

  const filterItemsBySearch = (items: NavItem[]) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => item.label.toLowerCase().includes(query));
  };

  const filteredMainItems = filterItemsBySearch(mainNavItems);
  const filteredSecondaryItems = filterItemsBySearch(secondaryNavItems);
  const filteredBottomItems = filterItemsBySearch(bottomNavItems);

  const renderMenuSection = (label: string, icon: any, items: NavItem[], showDivider: boolean = true) => {
    const filtered = filterItemsBySearch(items);
    if (searchQuery.trim() && filtered.length === 0) return null;
    
    return (
      <>
        <div className="flex items-center gap-3 mt-4 mb-3 pl-6">
          <div className="bg-slate-900 rounded-lg p-2 flex-shrink-0">
            {React.createElement(icon, { className: 'w-5 h-5 text-white' })}
          </div>
          <p className="text-[16px] font-black text-slate-500">{label}</p>
        </div>
        {filtered.map(renderMenuItem)}
        {showDivider && <div className="h-px bg-slate-100 my-4"></div>}
      </>
    );
  };

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
        className={`w-full flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300 relative group ml-6 mr-10 ${
            isActive ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3 text-left">
           <div className="relative">
             <item.icon className={`w-4 h-4 font-bold ${isActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-500'}`} />
             {isUnread && (
               <span className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                 isAlertItem ? 'bg-red-500 animate-pulse ring-4 ring-red-500/20' : 'bg-[#00ff8e]'
               }`}></span>
             )}
           </div>
           <span className={`text-sm font-semibold tracking-wide ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{item.label}</span>
        </div>
        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-slate-700' : 'text-slate-200'}`} />
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
                  <div className="absolute top-0 left-0 w-80 h-full bg-white shadow-2xl animate-slide-in-left flex flex-col overflow-hidden pt-safe pb-24 rounded-r-2xl" onClick={e => e.stopPropagation()}>
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                           <div className="flex items-center gap-3 flex-1">
                             <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100 shadow-sm">
                               <img src={currentUser.schoolLogo || ''} alt="School" className="w-full h-full object-cover rounded-full" />
                             </div>
                             <p className="text-sm font-semibold text-slate-800">{currentUser.school || 'School'}</p>
                           </div>
                           <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-slate-400"><X className="w-6 h-6" /></button>
                      </div>
                      
                      <div className="px-6 py-4 border-b border-slate-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                          <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100 text-slate-700 placeholder-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" 
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 pl-6 pr-10 py-6 space-y-2 overflow-y-auto custom-scrollbar text-left relative">
                           <div className="absolute left-6 top-0 bottom-0 border-l-2 border-dashed border-slate-300"></div>
                           {renderMenuSection('Main Experience', BookOpen, mainNavItems, true)}
                           {renderMenuSection('Curriculum & Data', Book, secondaryNavItems, true)}
                           {renderMenuSection('Account & Policy', Shield, bottomNavItems, false)}
                      </div>
                      
                      <div className="border-t border-slate-200 bg-white px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-white ring-offset-2 ring-offset-green-500" />
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                            <p className="text-xs text-slate-500">{currentUser.email}</p>
                          </div>
                        </div>
                        <button onClick={onLogout} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                          <LogOut className="w-5 h-5" />
                        </button>
                      </div>
                  </div>
              </div>
          )}
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 pb-32 overflow-y-auto overflow-x-hidden">
          {children}
        </main>

        {/* Shortcuts Button - Fixed to right side above bottom nav */}
        <div className="fixed bottom-24 right-6 w-14 h-14 rounded-full z-[45]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f06e" />
                <stop offset="50%" stopColor="#017eb6" />
                <stop offset="100%" stopColor="#00b5da" />
              </linearGradient>
            </defs>
            <circle cx="28" cy="28" r="26" fill="white" stroke="url(#gradientStroke)" strokeWidth="4" />
          </svg>
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="absolute inset-0 rounded-full flex items-center justify-center transition-colors hover:bg-white/80"
            title="Quick Shortcuts"
          />
        </div>

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
                          {isActive ? (
                            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-xl scale-110 relative" style={{
                              background: '#000',
                              boxShadow: '0 0 20px rgba(0, 240, 110, 0.3), 0 0 0 1px rgba(0, 240, 110, 0.2)'
                            }}>
                              <item.icon className="w-6 h-6 relative z-10" style={{
                                color: '#00f06e',
                                filter: 'drop-shadow(0 0 6px rgba(1, 126, 182, 0.5))',
                              }} />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all duration-500">
                              <item.icon className="w-6 h-6" />
                            </div>
                          )}
                          {isUnread && (
                            <span className={`absolute top-3 right-[22%] w-3 h-3 rounded-full border-2 border-white shadow-md ${
                              isAlertItem ? 'bg-red-500 animate-pulse' : 'bg-[#00ff8e]'
                            }`}></span>
                          )}
                          <span className={`text-[8px] mt-1 font-black transition-all ${isActive ? 'text-[#072432] opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>{item.label}</span>
                      </button>
                  );
              })}
          </div>
        </div>
      </div>

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        currentUser={currentUser}
        onSetActiveTab={setActiveTab}
        onCreateHomework={onCreateHomework}
        onCreateJournal={onCreateJournal}
        onCreateResource={onCreateResource}
      />
      <Toaster position="bottom-center" richColors style={{ marginBottom: '90px' }} />
    </NextPushProvider>
  );
};

export default Layout;
