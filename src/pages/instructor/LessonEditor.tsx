import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLessons, LessonType } from '@/hooks/useLessons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, Video, FileText, Image, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonEditor() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const isNew = !lessonId || lessonId === 'new';

    // We pass courseId to hook because it's needed for creating new lessons (invalidation context)
    const { createLesson, updateLesson } = useLessons(courseId || '');

    // Fetch existing lesson if editing
    const { data: lesson, isLoading } = useQuery({
        queryKey: ['lesson', lessonId],
        queryFn: async () => {
            if (isNew) return null;
            const { data, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('id', lessonId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !isNew
    });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        lesson_type: 'video' as LessonType,
        content_url: '',
        duration: 10
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (lesson) {
            setFormData({
                title: lesson.title,
                description: lesson.description || '',
                lesson_type: lesson.lesson_type as LessonType,
                content_url: lesson.content_url || '',
                duration: lesson.duration || 10
            });
        }
    }, [lesson]);

    const handleSave = async () => {
        if (!formData.title) return toast.error('Title is required');

        setIsSaving(true);
        try {
            if (isNew) {
                await createLesson.mutateAsync(formData);
            } else {
                await updateLesson.mutateAsync({ id: lessonId!, ...formData });
            }
            navigate(`/instructor/courses/${courseId}`, { replace: true });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container py-8 max-w-3xl">
            <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" onClick={() => navigate(`/instructor/courses/${courseId}`)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Save Lesson
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{isNew ? 'New Lesson' : 'Edit Lesson'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Lesson Title</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Setting up the environment"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Content Type</Label>
                            <Select
                                value={formData.lesson_type}
                                onValueChange={(v) => setFormData({ ...formData, lesson_type: v as LessonType })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video"><div className="flex items-center"><Video className="mr-2 h-4 w-4" /> Video</div></SelectItem>
                                    <SelectItem value="document"><div className="flex items-center"><FileText className="mr-2 h-4 w-4" /> Document</div></SelectItem>
                                    <SelectItem value="image"><div className="flex items-center"><Image className="mr-2 h-4 w-4" /> Image</div></SelectItem>
                                    <SelectItem value="quiz"><div className="flex items-center"><HelpCircle className="mr-2 h-4 w-4" /> Quiz</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Duration (minutes)</Label>
                            <Input
                                type="number"
                                min="1"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Content URL</Label>
                        <Input
                            value={formData.content_url}
                            onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                            placeholder={formData.lesson_type === 'video' ? 'https://youtube.com/...' : 'https://...'}
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.lesson_type === 'video' ? 'Enter YouTube or Vimeo URL' : 'Enter direct link to file/image'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="min-h-[150px]"
                        />
                    </div>

                    {formData.lesson_type === 'quiz' && !isNew && (
                        <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h4 className="font-medium">Quiz Content</h4>
                                <p className="text-sm text-muted-foreground">Manage questions for this quiz</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    // If content_url is already a UUID, it's likely a quiz ID
                                    // But better to check or just assume if it looks like one. 
                                    // For now, we'll try to use it or create a new one.

                                    let quizId = formData.content_url;

                                    // Simple check if it's a valid UUID (loose check)
                                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quizId);

                                    if (!quizId || !isUuid) {
                                        // Create new Quiz
                                        try {
                                            const { data: newQuiz, error } = await supabase
                                                .from('quizzes')
                                                .insert([{
                                                    title: formData.title,
                                                    description: formData.description,
                                                    course_id: courseId! // Required by DB
                                                }])
                                                .select()
                                                .single();

                                            if (error) throw error;

                                            quizId = newQuiz.id;

                                            // Update Lesson with new Quiz ID
                                            await updateLesson.mutateAsync({
                                                id: lessonId!,
                                                content_url: quizId
                                            });

                                            // Update local state
                                            setFormData(prev => ({ ...prev, content_url: quizId }));

                                        } catch (e) {
                                            console.error(e);
                                            toast.error('Failed to create quiz');
                                            return;
                                        }
                                    }

                                    navigate(`/instructor/courses/${courseId}/quiz/${quizId}`);
                                }}
                            >
                                Open Quiz Builder
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
