import React from 'react';
import { User } from '../types';
import { MessageSquareOff } from 'lucide-react';

interface ChatModuleDummyProps {
  currentUser: User;
}

const ChatModuleDummy: React.FC<ChatModuleDummyProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-20 px-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="bg-slate-100 p-6 rounded-full">
          <MessageSquareOff className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Community Chat Disabled</h2>
        <p className="text-slate-600 leading-relaxed">
          The community chat feature is currently disabled. Please use the Directory to find and message specific users.
        </p>
        <div className="mt-6 p-4 bg-black rounded-2xl w-full">
          <p className="text-sm text-white">
            <strong>Tip:</strong> Use the Directory tab to send direct messages to other users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatModuleDummy;
