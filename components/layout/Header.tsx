'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { User as UserIcon } from 'lucide-react';

export default function Header() {
  const { getCurrentUser, logout } = useAuth();
  const user = getCurrentUser();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1" />
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <div className="text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Not logged in</div>
        )}
      </div>
    </header>
  );
}