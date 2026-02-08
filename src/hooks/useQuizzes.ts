import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Quiz {
    id: string;
    course_id: string;
    title: string;
    description: string;
    // passing_score removed as it's not in DB
    created_at: string;
    updated_at: string;
    questions?: Question[];
}

export interface Question {
    id: string;
    quiz_id: string;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false';
    points: number;
    sort_order: number;
    options?: Option[];
}

export interface Option {
    id: string;
    question_id: string;
    option_text: string;
    is_correct: boolean;
    sort_order: number;
}

export function useQuizzes(courseId: string) {
    const queryClient = useQueryClient();

    // Fetch quizzes (basic list)
    // Note: quizzes table might link to course or lesson. Assuming lesson for now or direct course link if scheme allows.
    // Based on typical LMS, quizzes are often attached to lessons.
    // For simplicity, we'll assume a quiz is a content type of a lesson, 
    // BUT the quiz structure itself is stored in `quizzes` table.
    // The walkthrough implies direct quiz management.

    const useQuiz = (quizId: string) => useQuery({
        queryKey: ['quiz', quizId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('quizzes')
                .select(`
          *,
          questions:quiz_questions(
            *,
            options:quiz_options(*)
          )
        `)
                .eq('id', quizId)
                .single();

            if (error) throw error;

            // Sort questions and options
            // We need to cast because Supabase types might not perfectly infer the aliased relationships
            const quiz = data as unknown as Quiz;

            if (quiz.questions) {
                quiz.questions.sort((a: Question, b: Question) => a.sort_order - b.sort_order);
                quiz.questions.forEach((q: Question) => {
                    if (q.options) {
                        q.options.sort((a: Option, b: Option) => a.sort_order - b.sort_order);
                    }
                });
            }

            return quiz;
        },
        enabled: !!quizId,
    });

    // Create Quiz (usually associated with a lesson, but here independent resource)
    const createQuiz = useMutation({
        mutationFn: async (quizData: Partial<Quiz> & { title: string, course_id: string }) => {
            const { data, error } = await supabase
                .from('quizzes')
                .insert([quizData])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
            toast.success('Quiz created');
        },
    });

    // Update Quiz
    const updateQuiz = useMutation({
        mutationFn: async ({ id, ...updates }: { id: string, [key: string]: any }) => {
            const { data, error } = await supabase
                .from('quizzes')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['quiz', data.id] });
            toast.success('Quiz updated');
        },
    });

    // Add Question
    const createQuestion = useMutation({
        mutationFn: async (questionData: Partial<Question> & { quiz_id: string, question_text: string }) => {
            // Get max sort order
            const { data: existing } = await supabase
                .from('quiz_questions')
                .select('sort_order')
                .eq('quiz_id', questionData.quiz_id)
                .order('sort_order', { ascending: false })
                .limit(1);

            const nextOrder = existing?.length ? existing[0].sort_order + 1 : 0;

            const { data, error } = await supabase
                .from('quiz_questions')
                .insert([{ ...questionData, sort_order: nextOrder }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['quiz', variables.quiz_id] });
            toast.success('Question added');
        },
    });

    // Add Option
    const createOption = useMutation({
        mutationFn: async (optionData: Partial<Option> & { question_id: string, option_text: string }) => {
            // Get max sort order
            const { data: existing } = await supabase
                .from('quiz_options')
                .select('sort_order')
                .eq('question_id', optionData.question_id)
                .order('sort_order', { ascending: false })
                .limit(1);

            const nextOrder = existing?.length ? existing[0].sort_order + 1 : 0;

            const { data, error } = await supabase
                .from('quiz_options')
                .insert([{ ...optionData, sort_order: nextOrder }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] }); // Invalidate all quizzes or specific one if we had ID
            toast.success('Option added');
        },
    });

    const deleteQuiz = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('quizzes').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
            toast.success('Quiz deleted');
        }
    });

    const deleteQuestion = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
            toast.success('Question deleted');
        }
    });

    const deleteOption = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('quiz_options').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
            toast.success('Option deleted');
        }
    });

    return {
        useQuiz,
        createQuiz,
        updateQuiz,
        createQuestion,
        createOption,
        deleteQuiz,
        deleteQuestion,
        deleteOption
    };
}
