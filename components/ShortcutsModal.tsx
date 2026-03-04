'use client';

import React from 'react';
import {
  X,
  FileText,
  BookMarked,
  BookOpen,
  Users,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSetActiveTab?: (tab: string) => void;
  onCreateHomework?: () => void;
  onCreateJournal?: () => void;
  onCreateResource?: () => void;
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSetActiveTab,
  onCreateHomework,
  onCreateJournal,
  onCreateResource,
}) => {
  if (!isOpen) return null;

  const isTeacher = currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.PRINCIPAL;

  const shortcuts = [
    { id: 'create-homework', label: 'Create Homework', icon: FileText, teacherOnly: true },
    { id: 'create-journal', label: 'Create Journal Entry', icon: BookMarked, teacherOnly: true },
    { id: 'create-resource', label: 'Create Learning Resource', icon: BookOpen, teacherOnly: true },
    { id: 'directory', label: 'Go to Directory', icon: Users, teacherOnly: false },
  ];

  const handleShortcutClick = (shortcutId: string) => {
    const tabMap: { [key: string]: string } = {
      'create-homework': 'homework',
      'create-journal': 'journal',
      'create-resource': 'tutoring',
      'directory': 'directory',
    };
    
    const tabId = tabMap[shortcutId];
    if (tabId && onSetActiveTab) {
      onSetActiveTab(tabId);
    }
    
    // Trigger creation callbacks only for teachers/principals
    if (isTeacher) {
      if (shortcutId === 'create-homework' && onCreateHomework) {
        onCreateHomework();
      } else if (shortcutId === 'create-journal' && onCreateJournal) {
        onCreateJournal();
      } else if (shortcutId === 'create-resource' && onCreateResource) {
        onCreateResource();
      }
    }
    
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[60]" 
        onClick={onClose}
      />
      
      {/* Vertical Stack Panel */}
      <div className="fixed bottom-40 right-6 z-[65] flex flex-col gap-3">
        {shortcuts.map((shortcut, index) => {
          const Icon = shortcut.icon;
          const title = shortcut.teacherOnly && !isTeacher 
            ? `${shortcut.label} (view only for students)`
            : shortcut.label;
          
          return (
            <button
              key={shortcut.id}
              onClick={() => handleShortcutClick(shortcut.id)}
              disabled={false}
              className="w-12 h-12 rounded-full bg-black border-2 border-white flex items-center justify-center transition-all drop-shadow-lg hover:bg-neutral-800 hover:drop-shadow-xl"
              style={{
                animation: `slideIn 0.3s ease-out forwards`,
                animationDelay: `${index * 0.05}s`,
              }}
              title={title}
            >
              <Icon className="w-5 h-5 text-white" />
            </button>
          );
        })}
      </div>
    </>
  );
};

export default ShortcutsModal;
