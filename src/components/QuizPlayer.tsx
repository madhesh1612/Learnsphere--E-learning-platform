import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Quiz, Question, Option } from '@/hooks/useQuizzes';

interface QuizPlayerProps {
    quizId: string;
    onComplete: (score: number, passed: boolean) => void;
}

export default function QuizPlayer({ quizId, onComplete }: QuizPlayerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
    const [quizstate, setQuizState] = useState<'intro' | 'playing' | 'review'>('intro');
    const [score, setScore] = useState(0);
    const [attemptId, setAttemptId] = useState<string | null>(null);

    // Fetch Quiz Data
    const { data: quiz, isLoading } = useQuery({
        queryKey: ['play-quiz', quizId],
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

            // Transform and sort
            const quizData = data as unknown as Quiz;
            if (quizData.questions) {
                quizData.questions.sort((a, b) => a.sort_order - b.sort_order);
                quizData.questions.forEach(q => {
                    q.options?.sort((a, b) => a.sort_order - b.sort_order);
                });
            }
            return quizData;
        },
        enabled: !!quizId
    });

    const startAttempt = async () => {
        try {
            const { data, error } = await supabase
                .from('quiz_attempts')
                .insert([{
                    quiz_id: quizId,
                    user_id: (await supabase.auth.getUser()).data.user?.id!,
                    started_at: new Date().toISOString(),
                    is_completed: false
                }])
                .select()
                .single();

            if (error) throw error;
            setAttemptId(data.id);
            setQuizState('playing');
        } catch (error) {
            console.error('Failed to start attempt:', error);
            toast.error('Failed to start quiz');
        }
    };

    const submitQuiz = async () => {
        if (!quiz || !attemptId) return;

        let calculatedScore = 0;
        let correctAnswersCount = 0;
        const answersToInsert: any[] = [];

        quiz.questions?.forEach(q => {
            const selectedOptionId = selectedAnswers[q.id];
            const selectedOption = q.options?.find(o => o.id === selectedOptionId);
            const isCorrect = selectedOption?.is_correct || false;

            if (isCorrect) {
                calculatedScore += q.points || 0;
                correctAnswersCount++;
            }

            answersToInsert.push({
                attempt_id: attemptId,
                question_id: q.id,
                selected_option_id: selectedOptionId || null,
                is_correct: isCorrect,
                answered_at: new Date().toISOString()
            });
        });

        try {
            // 1. Save answers
            const { error: ansError } = await supabase
                .from('quiz_attempt_answers')
                .insert(answersToInsert);

            if (ansError) throw ansError;

            // 2. Update attempt
            const { error: attError } = await supabase
                .from('quiz_attempts')
                .update({
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                    score: calculatedScore,
                    correct_answers: correctAnswersCount,
                    // Assuming total questions is purely count, not points? DB schema has total_questions
                    total_questions: quiz.questions?.length || 0,
                    points_earned: calculatedScore // Assuming simple 1-1 mapping for now
                })
                .eq('id', attemptId);

            if (attError) throw attError;

            setScore(calculatedScore);
            setQuizState('review');

            // Determine pass/fail (e.g. > 70%)
            const totalPoints = quiz.questions?.reduce((acc, q) => acc + (q.points || 0), 0) || 1;
            const percentage = (calculatedScore / totalPoints) * 100;
            const passed = percentage >= 70; // Hardcoded 70% for now

            onComplete(calculatedScore, passed);

        } catch (error) {
            console.error('Failed to submit quiz:', error);
            toast.error('Failed to submit quiz');
        }
    };

    if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;
    if (!quiz) return <div className="text-center p-8">Quiz not found</div>;

    const currentQuestion = quiz.questions?.[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === (quiz.questions?.length || 0) - 1;
    const totalPoints = quiz.questions?.reduce((acc, q) => acc + (q.points || 0), 0) || 0;

    if (quizstate === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                <h2 className="text-2xl font-bold">{quiz.title}</h2>
                <p className="text-muted-foreground">{quiz.description}</p>
                <div className="text-left space-y-2 bg-muted p-4 rounded-lg text-sm">
                    <p>• Questions: {quiz.questions?.length}</p>
                    <p>• Total Points: {totalPoints}</p>
                    <p>• Passing Score: 70%</p>
                </div>
                <Button onClick={startAttempt} size="lg">Start Quiz</Button>
            </div>
        );
    }

    if (quizstate === 'review') {
        const percentage = Math.round((score / totalPoints) * 100);
        const passed = percentage >= 70;

        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="mb-4">
                    {passed ? (
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    ) : (
                        <XCircle className="h-16 w-16 text-destructive mx-auto" />
                    )}
                </div>
                <h2 className="text-2xl font-bold">{passed ? 'Quiz Passed!' : 'Quiz Failed'}</h2>
                <div className="text-4xl font-bold mb-2">{percentage}%</div>
                <p className="text-muted-foreground">You scored {score} out of {totalPoints} points</p>

                <Button onClick={() => {
                    setQuizState('intro');
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers({});
                    setScore(0);
                    setAttemptId(null);
                }} variant="outline">
                    Retry Quiz
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="mb-6 flex justify-between items-center text-sm text-muted-foreground">
                <span>Question {currentQuestionIndex + 1} of {quiz.questions?.length}</span>
                <span>{score} points potential</span>
            </div>

            {currentQuestion && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup
                            value={selectedAnswers[currentQuestion.id] || ''}
                            onValueChange={(val) => setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
                        >
                            {currentQuestion.options?.map((option) => (
                                <div key={option.id} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                                    <RadioGroupItem value={option.id} id={option.id} />
                                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">{option.option_text}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>

                        {isLastQuestion ? (
                            <Button onClick={submitQuiz} disabled={Object.keys(selectedAnswers).length < (quiz.questions?.length || 0)}>
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                                Next
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
