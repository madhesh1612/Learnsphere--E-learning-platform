import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, LayoutGrid, List, Eye, Clock, BookOpen, Edit, Share2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDuration } from '@/lib/supabase';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  tags: string[];
  views_count: number;
  total_duration: number;
  is_published: boolean;
  lessons_count?: number;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const coursesWithCounts = await Promise.all(
        (data || []).map(async (course) => {
          const { count } = await supabase
            .from('lessons')
            .select('id', { count: 'exact' })
            .eq('course_id', course.id);
          return { ...course, lessons_count: count || 0 };
        })
      );

      setCourses(coursesWithCounts);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!user || !newCourseTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({ title: newCourseTitle.trim(), instructor_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast.success('Course created!');
      setShowCreateDialog(false);
      setNewCourseTitle('');
      navigate(`/admin/courses/${data.id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-1">Manage your courses and content</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Course Name</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to React"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCourse()}
                />
              </div>
              <Button onClick={handleCreateCourse} className="w-full">Create Course</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
          <TabsList>
            <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="list"><List className="h-4 w-4" /></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No courses yet</h3>
          <p className="text-muted-foreground mb-4">Create your first course to get started</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />Create Course
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
          {filteredCourses.map((course) => (
            <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/admin/courses/${course.id}`)}>
              <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">{course.title}</h3>
                    {course.is_published && <Badge variant="default" className="text-xs">Published</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.tags?.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{course.views_count}</span>
                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.lessons_count}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDuration(course.total_duration)}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/admin/courses/${course.id}`); }}>
                      <Edit className="mr-2 h-4 w-4" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/course/${course.id}`); toast.success('Link copied!'); }}>
                      <Share2 className="mr-2 h-4 w-4" />Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
