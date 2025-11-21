import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user-service';

export function AccountNotFound() {
  const { user, signOut } = useAuth();
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const data = await userService.getCurrentUser();
        if (!data) {
          setFetchError('User record not found (returned null). RLS policy might be blocking access.');
        }
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };
    checkUser();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Account Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your login was successful, but we couldn't retrieve your user profile.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Debug Info:
          </p>
          <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-4">
            User ID: {user.id}
            {fetchError && (
              <div className="mt-2 text-red-600 dark:text-red-400">
                Error: {fetchError}
              </div>
            )}
          </div>

          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Possible Fix (Run in Supabase SQL Editor):
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            If you see an "infinite recursion" or policy error, run this to fix the RLS policy:
          </p>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
{`-- Fix RLS Policy Recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON app_users;

CREATE POLICY "Users can view their own profile"
  ON app_users FOR SELECT TO authenticated
  USING (id = auth.uid());`}
            </pre>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-maroon-600 hover:bg-maroon-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Retry Login
          </button>
          <button
            onClick={() => signOut()}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
