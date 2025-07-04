'use client';

import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4 lg:p-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center px-4 sm:px-6 py-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">Visa Admin Panel</CardTitle>
          <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">Sign in to access the admin interface</p>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6 pb-6">
          <Button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-12 sm:h-14 text-sm sm:text-base"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </Button>
          
          <div className="text-xs sm:text-sm text-gray-500 text-center space-y-2">
            <p>Access restricted to authorized personnel only.</p>
            <p>Contact administrator if you need access.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UnauthorizedPage() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4 lg:p-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center px-4 sm:px-6 py-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-red-600">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center px-4 sm:px-6 pb-6">
          <div className="space-y-3">
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Sorry, <strong className="break-all text-gray-900">{user?.email}</strong> is not authorized to access this admin panel.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Please contact the administrator to request access.
            </p>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="w-full h-12 sm:h-14 text-sm sm:text-base"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 