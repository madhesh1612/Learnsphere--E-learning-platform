import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useInstructorCourses() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch all courses for the current instructor
    const { data: courses, isLoading } = useQuery({
        queryKey: ['instructor-courses', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from('courses')
                .select(`
          *,
          _count: enrollments(count),
          lessons: lessons(count)
        `)
                .eq('instructor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(course => ({
                ...course,
                studentCount: course._count?.[0]?.count || 0, // Fix: handle array response for count
                lessonCount: course.lessons?.[0]?.count || 0
            }));
        },
        enabled: !!user,
    });

    // Fetch single course details
    const useInstructorCourse = (courseId: string) => useQuery({
        queryKey: ['instructor-course', courseId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (error) throw error;

            // Verify ownership
            if (data.instructor_id !== user?.id) {
                throw new Error('You do not have permission to view this course');
            }

            return data;
        },
        enabled: !!courseId && !!user,
    });

    // Create new course
    const createCourse = useMutation({
        mutationFn: async (courseData: any) => {
            const { data, error } = await supabase
                .from('courses')
                .insert([{ ...courseData, instructor_id: user?.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
            toast.success('Course created successfully');
        },
        onError: (error) => {
            toast.error('Failed to create course');
            console.error(error);
        },
    });

    // Update course
    const updateCourse = useMutation({
        mutationFn: async ({ id, ...updates }: { id: string, [key: string]: any }) => {
            // Verify ownership first
            const { data: existing } = await supabase
                .from('courses')
                .select('instructor_id')
                .eq('id', id)
                .single();

            if (existing?.instructor_id !== user?.id) {
                throw new Error('You do not have permission to edit this course');
            }

            const { data, error } = await supabase
                .from('courses')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
            queryClient.invalidateQueries({ queryKey: ['instructor-course', data.id] });
            toast.success('Course updated successfully');
        },
        onError: (error) => {
            toast.error('Failed to update course');
            console.error(error);
        },
    });

    // Delete course
    const deleteCourse = useMutation({
        mutationFn: async (id: string) => {
            // Verify ownership first
            const { data: existing } = await supabase
                .from('courses')
                .select('instructor_id')
                .eq('id', id)
                .single();

            if (existing?.instructor_id !== user?.id) {
                throw new Error('You do not have permission to delete this course');
            }

            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
            toast.success('Course deleted successfully');
        },
        onError: (error) => {
            toast.error('Failed to delete course');
            console.error(error);
        },
    });

    return {
        courses,
        isLoading,
        useInstructorCourse,
        createCourse,
        updateCourse,
        deleteCourse
    };
}
