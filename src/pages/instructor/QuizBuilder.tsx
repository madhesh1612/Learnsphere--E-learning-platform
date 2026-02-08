import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizzes, Question, Option } from '@/hooks/useQuizzes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Save, GripVertical, CheckCircle2, Circle } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function QuizBuilder() {
    const { courseId, lessonId, quizId } = useParams(); // quizId is what we really need
    const navigate = useNavigate();
    const { useQuiz, createQuestion, createOption, deleteQuestion, deleteOption, updateQuiz } = useQuizzes(courseId || '');

    // If we came from LessonEditor/CourseContentEditor, the quizId might be in the URL params as `quizId` or `lessonId` if we reused the route.
    // The route definition in App.tsx is `.../quiz/:quizId?`.
    const effectiveQuizId = quizId || lessonId; // Fallback if routed weirdly, but usually quizId

    const { data: quiz, isLoading } = useQuiz(effectiveQuizId || '');

    const [newQuestionText, setNewQuestionText] = useState('');
    const [newQuestionType, setNewQuestionType] = useState<'multiple_choice' | 'true_false'>('multiple_choice');
    const [newQuestionPoints, setNewQuestionPoints] = useState(10);
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);

    // Temp state for editing quiz details
    // const [quizTitle, setQuizTitle] = useState(''); // Could add quiz edit mode

    const handleAddQuestion = async () => {
        if (!newQuestionText) return toast.error('Question text is required');

        try {
            await createQuestion.mutateAsync({
                quiz_id: effectiveQuizId!,
                question_text: newQuestionText,
                question_type: newQuestionType,
                points: newQuestionPoints
            });
            setNewQuestionText('');
            setIsAddingQuestion(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddOption = async (questionId: string, text: string, isCorrect: boolean) => {
        if (!text) return;
        try {
            await createOption.mutateAsync({
                question_id: questionId,
                option_text: text,
                is_correct: isCorrect
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!quiz) return <div className="p-8">Quiz not found</div>;

    return (
        <div className="container py-8 max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(`/instructor/courses/${courseId}`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                        <CardDescription>{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Questions: {quiz.questions?.length || 0}</span>
                            <span>Total Points: {quiz.questions?.reduce((acc, q) => acc + (q.points || 0), 0) || 0}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {quiz.questions?.map((question, qIndex) => (
                        <Card key={question.id} className="relative group">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-muted w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                                            {qIndex + 1}
                                        </span>
                                        <h3 className="font-medium text-lg">{question.question_text}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                            {question.points} pts
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                if (confirm('Delete this question?')) deleteQuestion.mutate(question.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 pl-8">
                                    {question.options?.map((option) => (
                                        <div key={option.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 group/option">
                                            {option.is_correct ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                            ) : (
                                                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                            )}
                                            <span className={option.is_correct ? 'font-medium' : ''}>{option.option_text}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 ml-auto opacity-0 group-hover/option:opacity-100 text-destructive"
                                                onClick={() => deleteOption.mutate(option.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}

                                    <div className="mt-4 flex gap-2 items-center">
                                        <Input
                                            placeholder="Add an option..."
                                            className="max-w-xs h-8 text-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const target = e.target as HTMLInputElement;
                                                    handleAddOption(question.id, target.value, false);
                                                    target.value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-8"
                                            onClick={(e) => {
                                                // This creates a correct answer option immediately
                                                // Ideally UI would let user toggle correctness after adding
                                                // For now let's keep it simple: just add as incorrect, then user deletes/re-adds?
                                                // Better: Add as incorrect by default (Enter), or have a 'Add Correct' button?
                                                // Let's rely on backend or minimal UI for now. 
                                                // Actually, let's add a small checkbox or proper form if needed.
                                                // For MVP: Simple input adds incorrect option.
                                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                handleAddOption(question.id, input.value, false);
                                                input.value = '';
                                            }}
                                        >
                                            Add
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-green-600 border-green-200 hover:bg-green-50"
                                            onClick={(e) => {
                                                const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                                                handleAddOption(question.id, input.value, true);
                                                input.value = '';
                                            }}
                                        >
                                            Add Correct
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {isAddingQuestion ? (
                        <Card className="border-dashed border-2">
                            <CardHeader>
                                <CardTitle className="text-base">New Question</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Question Text</Label>
                                    <Input
                                        value={newQuestionText}
                                        onChange={(e) => setNewQuestionText(e.target.value)}
                                        placeholder="e.g. What is the capital of France?"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="space-y-2 flex-1">
                                        <Label>Points</Label>
                                        <Input
                                            type="number"
                                            value={newQuestionPoints}
                                            onChange={(e) => setNewQuestionPoints(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <Label>Type</Label>
                                        <Select
                                            value={newQuestionType}
                                            onValueChange={(v: any) => setNewQuestionType(v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                                <SelectItem value="true_false">True/False</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" onClick={() => setIsAddingQuestion(false)}>Cancel</Button>
                                    <Button onClick={handleAddQuestion}>Add Question</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Button
                            className="w-full h-16 border-dashed border-2"
                            variant="ghost"
                            onClick={() => setIsAddingQuestion(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Question
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
