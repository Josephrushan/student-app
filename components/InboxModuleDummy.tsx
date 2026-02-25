import React from 'react';
import { User } from '../types';
import { AlertCircle } from 'lucide-react';

interface InboxModuleDummyProps {
  currentUser: User;
}

const InboxModuleDummy: React.FC<InboxModuleDummyProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-20 px-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="bg-slate-100 p-6 rounded-full">
          <AlertCircle className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Direct Messages Disabled</h2>
        <p className="text-slate-600 leading-relaxed">
          Direct messaging is currently disabled. This feature will be available in a future update.
        </p>
        <div className="mt-6 p-4 bg-black rounded-2xl w-full">
          <p className="text-sm text-white">
            <strong>Tip:</strong> Check the Directory for other ways to connect with users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InboxModuleDummy;
