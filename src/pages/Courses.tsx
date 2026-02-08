import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Star,
  Lock,
  Play,
  ArrowRight
} from 'lucide-react';
import { formatDuration } from '@/lib/supabase';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  short_description: string | null;
  image_url: string | null;
  tags: string[];
  total_duration: number;
  views_count: number;
  access_rule: string;
  price: number;
  instructor_id: string;
  profiles?: {
    full_name: string | null;
  };
  _count?: {
    lessons: number;
    enrollments: number;
  };
  avg_rating?: number;
  is_enrolled?: boolean;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch lesson counts, enrollments, and instructor info for each course
      const coursesWithCounts = await Promise.all(
        (data || []).map(async (course) => {
          const [lessonsRes, enrollmentsRes, reviewsRes, instructorRes] = await Promise.all([
            supabase.from('lessons').select('id', { count: 'exact' }).eq('course_id', course.id),
            supabase.from('enrollments').select('id', { count: 'exact' }).eq('course_id', course.id),
            supabase.from('reviews').select('rating').eq('course_id', course.id),
            course.instructor_id
              ? supabase.from('profiles').select('full_name').eq('id', course.instructor_id).maybeSingle()
              : Promise.resolve({ data: null }),
          ]);

          let isEnrolled = false;
          if (user) {
            const { data: enrollment } = await supabase
              .from('enrollments')
              .select('id')
              .eq('course_id', course.id)
              .eq('user_id', user.id)
              .maybeSingle();
            isEnrolled = !!enrollment;
          }

          const ratings = reviewsRes.data || [];
          const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

          return {
            ...course,
            profiles: instructorRes.data,
            _count: {
              lessons: lessonsRes.count || 0,
              enrollments: enrollmentsRes.count || 0,
            },
            avg_rating: avgRating,
            is_enrolled: isEnrolled,
          };
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

  const handleEnroll = async (course: Course) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (course.access_rule === 'payment') {
      toast.info('Payment feature coming soon!');
      return;
    }

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,
          status: 'active',
        });

      if (error) throw error;

      toast.success('Successfully enrolled!');
      navigate(`/course/${course.id}`);
    } catch (error: any) {
      if (error.code === '23505') {
        navigate(`/course/${course.id}`);
      } else {
        toast.error('Failed to enroll');
      }
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold lg:text-4xl">Explore Courses</h1>
        <p className="mt-2 text-muted-foreground">
          Discover courses to help you learn new skills and advance your career.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No courses found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? 'Try a different search term' : 'No courses are available yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <BookOpen className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                {course.access_rule === 'payment' && (
                  <div className="absolute top-2 right-2 bg-warning text-warning-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    ₹{course.price}
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {course.tags.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <h3 className="font-display font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                {course.short_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {course.short_description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pb-2">
                {/* Instructor */}
                <p className="text-xs text-muted-foreground mb-3">
                  By {course.profiles?.full_name || 'Instructor'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course._count?.lessons || 0} lessons
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(course.total_duration)}
                  </div>
                  {course.avg_rating && course.avg_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {course.avg_rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                {course.is_enrolled ? (
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={course.access_rule === 'payment' ? 'default' : 'default'}
                    onClick={() => handleEnroll(course)}
                  >
                    {course.access_rule === 'payment' ? (
                      <>Buy Course</>
                    ) : !user ? (
                      <>Join Course</>
                    ) : (
                      <>
                        Start Learning
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
