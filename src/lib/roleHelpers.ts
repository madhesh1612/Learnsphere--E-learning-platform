import type { UserRole } from './supabase';

// Hardcoded email configuration
export const ADMIN_EMAIL = 'admin@gmail.com';
export const INSTRUCTOR_EMAILS = ['instructor@gmail.com'];

/**
 * Determines user roles based on email address.
 * Admin: admin@gmail.com
 * Instructor: instructor@gmail.com
 * Learner: All others
 */
export function getRolesFromEmail(email: string | undefined): UserRole[] {
  if (!email) return [];

  if (email === ADMIN_EMAIL) return ['admin'];
  if (INSTRUCTOR_EMAILS.includes(email)) return ['instructor'];

  return ['learner'];
}

/**
 * Determines the primary role for a user with multiple roles.
 * Priority: admin > instructor > learner
 */
export function getPrimaryRole(roles: UserRole[]): UserRole | null {
  if (!roles || roles.length === 0) return null;

  if (roles.includes('admin')) return 'admin';
  if (roles.includes('instructor')) return 'instructor';
  if (roles.includes('learner')) return 'learner';

  return roles[0]; // Fallback to first role
}

/**
 * Returns the dashboard path for a given role
 */
export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'instructor':
      return '/instructor';
    case 'learner':
      return '/learner';
    default:
      return '/';
  }
}

/**
 * Checks if user has access to a route based on their roles
 */
export function canAccessRoute(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  if (!userRoles || userRoles.length === 0) return false;

  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Gets the appropriate redirect path based on user's primary role
 */
export function getRedirectPath(roles: UserRole[]): string {
  const primaryRole = getPrimaryRole(roles);
  return primaryRole ? getRoleDashboardPath(primaryRole) : '/';
}
