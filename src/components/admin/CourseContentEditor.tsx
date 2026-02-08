import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLessons, Lesson, LessonType } from '@/hooks/useLessons';
import { Plus, Video, FileText, Loader2, GripVertical, Trash2, Edit2, CheckSquare } from 'lucide-react';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'; // Or dnd-kit

interface CourseContentEditorProps {
    courseId: string;
}

export function CourseContentEditor({ courseId }: CourseContentEditorProps) {
    const {
        lessons,
        isLoading,
        createLesson,
        updateLesson,
        deleteLesson
    } = useLessons(courseId);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for new/edit lesson
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [lesson_type, setLessonType] = useState<LessonType>('video');
    const [contentUrl, setContentUrl] = useState('');
    const [duration, setDuration] = useState(0);

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const lessonData = {
                title,
                description,
                lesson_type,
                content_url: contentUrl,
                duration
            };

            if (editingLesson) {
                await updateLesson.mutateAsync({ id: editingLesson.id, ...lessonData });
            } else {
                await createLesson.mutateAsync(lessonData);
            }

            setIsAddOpen(false);
            setEditingLesson(null);
            resetForm();
        } catch (error) {
            console.error('Failed to save lesson:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setLessonType('video');
        setContentUrl('');
        setDuration(0);
    };

    const openEdit = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setTitle(lesson.title);
        setDescription(lesson.description || '');
        setLessonType(lesson.lesson_type);
        setContentUrl(lesson.content_url || '');
        setDuration(lesson.duration || 0);
        setIsAddOpen(true);
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Course Content</h3>
                <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content
                </Button>
            </div>

            <div className="space-y-2">
                {lessons?.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center gap-3 p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors group">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

                        <div className="flex items-center justify-center h-8 w-8 rounded bg-primary/10 text-primary shrink-0">
                            {lesson.lesson_type === 'video' && <Video className="h-4 w-4" />}
                            {lesson.lesson_type === 'document' && <FileText className="h-4 w-4" />}
                            {lesson.lesson_type === 'quiz' && <CheckSquare className="h-4 w-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">{lesson.lesson_type} • {lesson.duration}m</p>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(lesson)}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this lesson?')) {
                                        deleteLesson.mutate(lesson.id);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {(!lessons || lessons.length === 0) && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No content yet.</p>
                        <Button variant="link" onClick={() => { resetForm(); setIsAddOpen(true); }}>Add your first lesson</Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingLesson ? 'Edit Content' : 'Add Content'}</DialogTitle>
                        <DialogDescription>
                            Add a new video, document, or quiz to this course.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Content Type</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={lesson_type === 'video' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setLessonType('video')}
                                    className="flex-1"
                                >
                                    <Video className="h-4 w-4 mr-2" /> Video
                                </Button>
                                <Button
                                    type="button"
                                    variant={lesson_type === 'document' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setLessonType('document')}
                                    className="flex-1"
                                >
                                    <FileText className="h-4 w-4 mr-2" /> Document
                                </Button>
                                <Button
                                    type="button"
                                    variant={lesson_type === 'quiz' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setLessonType('quiz')}
                                    className="flex-1"
                                >
                                    <CheckSquare className="h-4 w-4 mr-2" /> Quiz
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lesson-title">Title</Label>
                            <Input
                                id="lesson-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Introduction to CRM"
                            />
                        </div>

                        {lesson_type === 'video' && (
                            <div className="space-y-2">
                                <Label htmlFor="video-url">Video URL</Label>
                                <Input
                                    id="video-url"
                                    value={contentUrl}
                                    onChange={(e) => setContentUrl(e.target.value)}
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this content"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
