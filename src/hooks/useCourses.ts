import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Course {
    id: string;
    title: string;
    description: string | null;
    short_description: string | null;
    image_url: string | null;
    tags: string[] | null;
    views_count: number;
    total_duration: number | null;
    is_published: boolean;
    published_at: string | null;
    visibility: 'everyone' | 'signed_in';
    access_rule: 'open' | 'invitation' | 'payment';
    price: number | null;
    website_url: string | null;
    instructor_id: string | null;
    responsible_id: string | null;
    created_at: string;
    updated_at: string;
    lesson_count?: number;
}

// Fetch all courses (admin view)
export function useAdminCourses() {
    return useQuery({
        queryKey: ['admin-courses'],
        queryFn: async () => {
            const { data: courses, error } = await supabase
                .from('courses')
                .select(`
          *,
          lessons:lessons(count)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform to include lesson count
            return (courses || []).map(course => ({
                ...course,
                lesson_count: course.lessons?.[0]?.count || 0,
            })) as Course[];
        },
    });
}

// Fetch single course
export function useCourse(id: string | undefined) {
    return useQuery({
        queryKey: ['course', id],
        queryFn: async () => {
            if (!id) return null;

            const { data, error } = await supabase
                .from('courses')
                .select(`
          *,
          lessons:lessons(
            id,
            title,
            lesson_type,
            duration,
            sort_order,
            content_url
          )
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Course;
        },
        enabled: !!id,
    });
}

// Create course
export function useCreateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseData: Partial<Course> & { title: string }) => {
            const { data, error } = await supabase
                .from('courses')
                .insert(courseData as any)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            toast.success('Course created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create course');
        },
    });
}

// Update course
export function useUpdateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...courseData }: Partial<Course> & { id: string }) => {
            const { data, error } = await supabase
                .from('courses')
                .update(courseData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
            toast.success('Course updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update course');
        },
    });
}

// Delete course
export function useDeleteCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            toast.success('Course deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete course');
        },
    });
}

// Toggle publish status
export function usePublishCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
            const updateData: any = { is_published };

            if (is_published) {
                updateData.published_at = new Date().toISOString();
            } else {
                updateData.published_at = null;
            }

            const { data, error } = await supabase
                .from('courses')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
            toast.success(variables.is_published ? 'Course published' : 'Course unpublished');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update course status');
        },
    });
}
