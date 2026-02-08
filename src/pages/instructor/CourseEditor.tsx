import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInstructorCourses } from '@/hooks/useInstructorCourses';
import { useLessons } from '@/hooks/useLessons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, ArrowLeft, Plus, MoveVertical, Trash, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseEditor() {
    const { id } = useParams(); // if id exists, we are editing
    const navigate = useNavigate();
    const { useInstructorCourse, createCourse, updateCourse } = useInstructorCourses();

    // Conditionally fetch course if ID exists
    const { data: course, isLoading: courseLoading } = useInstructorCourse(id || '');
    const { lessons, isLoading: lessonsLoading, deleteLesson } = useLessons(id || '');

    const [formData, setFormData] = useState({
        title: '',
        short_description: '',
        description: '',
        image_url: '',
        tags: '',
        is_published: false,
        price: 0,
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title,
                short_description: course.short_description || '',
                description: course.description || '',
                image_url: course.image_url || '',
                tags: course.tags?.join(', ') || '',
                is_published: course.is_published,
                price: course.price || 0,
            });
        }
    }, [course]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) return toast.error('Title is required');

        setIsSaving(true);
        try {
            const courseData = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                price: Number(formData.price) // Ensure number
            };

            if (id) {
                await updateCourse.mutateAsync({ id, ...courseData });
            } else {
                const newCourse = await createCourse.mutateAsync(courseData);
                navigate(`/instructor/courses/${newCourse.id}`, { replace: true });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (id && courseLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="container py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/instructor/courses')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-3xl font-bold font-display">
                        {id ? 'Edit Course' : 'Create New Course'}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" /> Save Course
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="content" disabled={!id}>Content</TabsTrigger>
                    <TabsTrigger value="settings" disabled={!id}>Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Details</CardTitle>
                            <CardDescription>Basic information about your course.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Introduction to React Patterns"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="short_desc">Short Description</Label>
                                <Input
                                    id="short_desc"
                                    value={formData.short_description}
                                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                    placeholder="Brief summary for course cards"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="desc">Full Description</Label>
                                <Textarea
                                    id="desc"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detailed layout of what students will learn..."
                                    className="min-h-[150px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="image">Cover Image URL</Label>
                                    <Input
                                        id="image"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags (comma separated)</Label>
                                    <Input
                                        id="tags"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="react, frontend, web dev"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="content">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-medium">Course Lessons</h3>
                            <p className="text-sm text-muted-foreground">Manage your course content structure</p>
                        </div>
                        <Button onClick={() => navigate(`/instructor/courses/${id}/lessons/new`)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Lesson
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {lessonsLoading ? (
                            <div>Loading lessons...</div>
                        ) : lessons?.length === 0 ? (
                            <div className="text-center py-12 border rounded-lg bg-muted/20">
                                <p className="text-muted-foreground">No lessons yet. Add your first lesson to get started.</p>
                            </div>
                        ) : (
                            lessons?.map((lesson) => (
                                <Card key={lesson.id} className="p-4 flex items-center gap-4">
                                    <MoveVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                    <div className="flex-1">
                                        <h4 className="font-medium">{lesson.title}</h4>
                                        <div className="text-sm text-muted-foreground flex gap-3">
                                            <span className="capitalize">{lesson.type}</span>
                                            <span>•</span>
                                            <span>{lesson.duration} min</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigate(`/instructor/courses/${id}/lessons/${lesson.id}`)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => {
                                                if (confirm('Delete this lesson?')) deleteLesson.mutate(lesson.id);
                                            }}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Publish Course</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Make this course visible to students
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.is_published}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                                />
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Price (USD)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                                <p className="text-xs text-muted-foreground">Set to 0 for free courses</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
