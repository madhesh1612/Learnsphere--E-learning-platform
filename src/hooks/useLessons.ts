import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type LessonType = 'video' | 'document' | 'image' | 'quiz';

export interface Lesson {
    id: string;
    course_id: string;
    title: string;
    description: string;
    lesson_type: LessonType;
    content_url: string | null;
    duration: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export function useLessons(courseId: string) {
    const queryClient = useQueryClient();

    // Fetch all lessons for a course
    const { data: lessons, isLoading } = useQuery({
        queryKey: ['course-lessons', courseId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('course_id', courseId)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data as Lesson[];
        },
        enabled: !!courseId,
    });

    // Create lesson
    const createLesson = useMutation({
        mutationFn: async (lessonData: Partial<Lesson> & { title: string }) => {
            // Get max sort order
            const { data: existingLessons } = await supabase
                .from('lessons')
                .select('sort_order')
                .eq('course_id', courseId)
                .order('sort_order', { ascending: false })
                .limit(1);

            const nextOrder = existingLessons?.length ? existingLessons[0].sort_order + 1 : 0;

            const { data, error } = await supabase
                .from('lessons')
                .insert([{ ...lessonData, course_id: courseId, sort_order: nextOrder }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
            toast.success('Lesson created successfully');
        },
    });

    // Update lesson
    const updateLesson = useMutation({
        mutationFn: async ({ id, ...updates }: { id: string, [key: string]: any }) => {
            const { data, error } = await supabase
                .from('lessons')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
            toast.success('Lesson updated successfully');
        },
    });

    // Delete lesson
    const deleteLesson = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('lessons')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
            toast.success('Lesson deleted successfully');
        },
    });

    // Reorder lessons
    const reorderLessons = useMutation({
        mutationFn: async (lessons: { id: string; sort_order: number }[]) => {
            const updates = lessons.map(({ id, sort_order }) =>
                supabase.from('lessons').update({ sort_order }).eq('id', id)
            );

            await Promise.all(updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
            // No toast needed for drag-drop usually
        },
    });

    return {
        lessons,
        isLoading,
        createLesson,
        updateLesson,
        deleteLesson,
        reorderLessons
    };
}
