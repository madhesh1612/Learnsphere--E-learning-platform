import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/supabase';
import { canAccessRoute, getRedirectPath } from '@/lib/roleHelpers';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, roles, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (!canAccessRoute(roles, allowedRoles)) {
        // Redirect to user's appropriate dashboard
        const redirectPath = getRedirectPath(roles);
        return <Navigate to={redirectPath} replace />;
    }

    // User is authenticated and has correct role
    return <>{children}</>;
}
