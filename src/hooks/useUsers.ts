import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    email: string; // fetched from auth.users via edge function or view if possible, otherwise rely on profile data
    full_name: string | null;
    avatar_url: string | null;
    role: 'learner' | 'instructor' | 'admin';
}

// Fetch all potential instructors/admins
export const useInstructors = () => {
    return useQuery({
        queryKey: ['instructors'],
        queryFn: async () => {
            // In a real app, we might need an edge function to get emails if not in public profile
            // For now, we fetch from profiles where role is instructor or admin
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['instructor', 'admin'])
                .order('full_name');

            if (error) throw error;
            return data as UserProfile[];
        },
    });
};
