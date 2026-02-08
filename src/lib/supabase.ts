import { supabase } from "@/integrations/supabase/client";

export { supabase };

// Helper types for the database
export type UserRole = 'admin' | 'instructor' | 'learner';
export type CourseVisibility = 'everyone' | 'signed_in';
export type CourseAccessRule = 'open' | 'invitation' | 'payment';
export type LessonType = 'video' | 'document' | 'image' | 'quiz';
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';
export type InviteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

// Badge levels
export const BADGE_LEVELS = [
  { name: 'Newbie', points: 20, icon: '🌱', color: 'success' },
  { name: 'Explorer', points: 40, icon: '🔍', color: 'primary' },
  { name: 'Achiever', points: 60, icon: '🏆', color: 'warning' },
  { name: 'Specialist', points: 80, icon: '⭐', color: 'accent' },
  { name: 'Expert', points: 100, icon: '💎', color: 'success' },
  { name: 'Master', points: 120, icon: '👑', color: 'warning' },
] as const;

// Get current badge level based on points
export function getCurrentBadge(points: number) {
  const badges = [...BADGE_LEVELS].reverse();
  return badges.find(b => points >= b.points) || BADGE_LEVELS[0];
}

// Get next badge level
export function getNextBadge(points: number) {
  return BADGE_LEVELS.find(b => b.points > points);
}

// Format duration in seconds to HH:MM:SS or MM:SS
export function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return '00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Parse duration string to seconds
export function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}
