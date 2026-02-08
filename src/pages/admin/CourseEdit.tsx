import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Eye, MoreVertical, Play, FileText, Image, HelpCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function AdminCourseEdit() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', lesson_type: 'video', content_url: '', duration: 0, allow_download: false });

  useEffect(() => {
    if (courseId) fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseRes, lessonsRes, quizzesRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('lessons').select('*').eq('course_id', courseId).order('sort_order'),
        supabase.from('quizzes').select('*').eq('course_id', courseId),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data || []);
      setQuizzes(quizzesRes.data || []);
    } catch (error) {
      toast.error('Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourse = async (updates: any) => {
    try {
      const { error } = await supabase.from('courses').update(updates).eq('id', courseId);
      if (error) throw error;
      setCourse({ ...course, ...updates });
      toast.success('Course updated!');
    } catch (error) {
      toast.error('Failed to update course');
    }
  };

  const handleSaveLesson = async () => {
    try {
      const lessonData = {
        title: lessonForm.title,
        description: lessonForm.description || null,
        lesson_type: lessonForm.lesson_type as 'video' | 'document' | 'image' | 'quiz',
        content_url: lessonForm.content_url || null,
        duration: lessonForm.duration,
        allow_download: lessonForm.allow_download,
      };
      
      if (editingLesson) {
        await supabase.from('lessons').update(lessonData).eq('id', editingLesson.id);
      } else {
        await supabase.from('lessons').insert({ ...lessonData, course_id: courseId!, sort_order: lessons.length });
      }
      toast.success('Lesson saved!');
      setShowLessonDialog(false);
      setEditingLesson(null);
      setLessonForm({ title: '', description: '', lesson_type: 'video', content_url: '', duration: 0, allow_download: false });
      fetchData();
    } catch (error) {
      toast.error('Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await supabase.from('lessons').delete().eq('id', lessonId);
      toast.success('Lesson deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete lesson');
    }
  };

  const openEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setLessonForm({ title: lesson.title, description: lesson.description || '', lesson_type: lesson.lesson_type, content_url: lesson.content_url || '', duration: lesson.duration || 0, allow_download: lesson.allow_download });
    setShowLessonDialog(true);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!course) return <div className="p-8 text-center">Course not found</div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/courses')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Label htmlFor="publish">Publish on website</Label>
          <Switch id="publish" checked={course.is_published} onCheckedChange={(v) => handleSaveCourse({ is_published: v, published_at: v ? new Date().toISOString() : null })} />
        </div>
        <Button variant="outline" onClick={() => window.open(`/course/${courseId}`, '_blank')}><Eye className="mr-2 h-4 w-4" />Preview</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <Input value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} onBlur={() => handleSaveCourse({ title: course.title })} className="text-2xl font-bold h-auto py-2" placeholder="Course Title" />
          <div className="flex gap-2">
            <Input value={course.tags?.join(', ') || ''} onChange={(e) => setCourse({ ...course, tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) })} onBlur={() => handleSaveCourse({ tags: course.tags })} placeholder="Tags (comma-separated)" />
          </div>
        </div>
        <Card><CardContent className="p-4 text-center text-muted-foreground"><Upload className="h-12 w-12 mx-auto mb-2" /><p className="text-sm">Course Image</p></CardContent></Card>
      </div>

      <Tabs defaultValue="content">
        <TabsList><TabsTrigger value="content">Content</TabsTrigger><TabsTrigger value="description">Description</TabsTrigger><TabsTrigger value="options">Options</TabsTrigger><TabsTrigger value="quiz">Quiz</TabsTrigger></TabsList>
        
        <TabsContent value="content" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Lessons</h3>
            <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Content</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingLesson ? 'Edit' : 'Add'} Lesson</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div><Label>Title</Label><Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} /></div>
                  <div><Label>Type</Label>
                    <Select value={lessonForm.lesson_type} onValueChange={(v) => setLessonForm({ ...lessonForm, lesson_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="document">Document</SelectItem><SelectItem value="image">Image</SelectItem><SelectItem value="quiz">Quiz</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Content URL</Label><Input value={lessonForm.content_url} onChange={(e) => setLessonForm({ ...lessonForm, content_url: e.target.value })} placeholder="YouTube URL or file URL" /></div>
                  <div><Label>Description</Label><Textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} /></div>
                  <div className="flex items-center gap-2"><Switch checked={lessonForm.allow_download} onCheckedChange={(v) => setLessonForm({ ...lessonForm, allow_download: v })} /><Label>Allow Download</Label></div>
                  <Button onClick={handleSaveLesson} className="w-full">Save Lesson</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {lessons.length === 0 ? <p className="text-center py-8 text-muted-foreground">No lessons yet. Add your first lesson!</p> : lessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="p-2 rounded-lg bg-muted">{getLessonIcon(lesson.lesson_type)}</div>
                  <div className="flex-1"><h4 className="font-medium">{lesson.title}</h4><p className="text-sm text-muted-foreground capitalize">{lesson.lesson_type}</p></div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent><DropdownMenuItem onClick={() => openEditLesson(lesson)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDeleteLesson(lesson.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="description" className="mt-6">
          <Textarea value={course.description || ''} onChange={(e) => setCourse({ ...course, description: e.target.value })} onBlur={() => handleSaveCourse({ description: course.description })} placeholder="Course description..." rows={8} />
        </TabsContent>
        
        <TabsContent value="options" className="mt-6">
          <div className="grid gap-6 max-w-md">
            <div><Label>Visibility</Label><Select value={course.visibility} onValueChange={(v) => handleSaveCourse({ visibility: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="everyone">Everyone</SelectItem><SelectItem value="signed_in">Signed In Only</SelectItem></SelectContent></Select></div>
            <div><Label>Access Rule</Label><Select value={course.access_rule} onValueChange={(v) => handleSaveCourse({ access_rule: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="invitation">On Invitation</SelectItem><SelectItem value="payment">On Payment</SelectItem></SelectContent></Select></div>
            {course.access_rule === 'payment' && <div><Label>Price</Label><Input type="number" value={course.price || 0} onChange={(e) => handleSaveCourse({ price: parseFloat(e.target.value) })} /></div>}
          </div>
        </TabsContent>
        
        <TabsContent value="quiz" className="mt-6">
          <p className="text-center py-8 text-muted-foreground">Quiz builder coming soon!</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
