import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle,
  Circle,
  Play,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  Star,
  Search,
  User
} from 'lucide-react';
import { formatDuration } from '@/lib/supabase';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  tags: string[];
  total_duration: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  lesson_type: string;
  duration: number;
  sort_order: number;
  is_completed?: boolean;
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  user_id: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth(); // Added signOut

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    if (!courseId) return;

    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Check enrollment
      if (user) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .maybeSingle();
        setIsEnrolled(!!enrollment);
      }

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order');

      // Fetch progress for each lesson
      if (user && lessonsData) {
        const lessonsWithProgress = await Promise.all(
          lessonsData.map(async (lesson) => {
            const { data: progress } = await supabase
              .from('lesson_progress')
              .select('is_completed')
              .eq('lesson_id', lesson.id)
              .eq('user_id', user.id)
              .maybeSingle();

            return {
              ...lesson,
              is_completed: progress?.is_completed || false,
            };
          })
        );
        setLessons(lessonsWithProgress);
      } else {
        setLessons(lessonsData || []);
      }

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (reviewsData) {
        const reviewsWithProfiles = await Promise.all(
          reviewsData.map(async (review) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', review.user_id)
              .maybeSingle();

            return { ...review, profile };
          })
        );
        setReviews(reviewsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    if (!isEnrolled && user) {
      toast.error('Please enroll in this course first');
      return;
    }
    navigate(`/lesson/${courseId}/${lessonId}`);
  };

  const handleSubmitReview = async () => {
    if (!user || !courseId) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          rating: reviewRating,
          review_text: reviewText,
        });

      if (error) throw error;

      toast.success('Review submitted!');
      setShowReviewDialog(false);
      fetchCourseData();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (e) {
      toast.error('Failed to sign out');
    }
  }

  const completedLessons = lessons.filter(l => l.is_completed).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-2/3 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header Section - matching wireframe */}
      <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-white/10 gap-4">
        <h1 className="text-xl font-bold tracking-tight">LearnSphere</h1>

        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleSignOut}>
          <span className="text-sm font-medium hidden sm:inline-block">Sign Out</span>
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-white/10">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="p-6 lg:px-12 space-y-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-8 bg-card border border-white/10 p-6 rounded-xl">
          {/* Left: Course Info */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Images */}
            <div className="shrink-0 w-full md:w-64 aspect-video bg-muted rounded-lg overflow-hidden border border-white/10 relative group">
              {course.image_url ? (
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                  <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-2">
              <Badge className="w-fit mb-1 bg-primary/20 text-primary border-primary/20 hover:bg-primary/30">Course</Badge>
              <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
              {course.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
              )}

              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-4">
                  {course.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Stats */}
          <div className="border border-white/10 rounded-lg p-4 bg-background/50 flex flex-col justify-center gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{progressPercent}% Completed</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="flex flex-col items-center p-3 bg-secondary/20 rounded border border-white/5">
                <span className="text-2xl font-bold">{lessons.length}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Content</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-secondary/20 rounded border border-white/5">
                <span className="text-2xl font-bold text-success">{completedLessons}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-secondary/20 rounded border border-white/5">
                <span className="text-2xl font-bold text-warning">{lessons.length - completedLessons}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Incomplete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex justify-between items-center border-b border-white/10 mb-6 flex-wrap gap-4">
            <TabsList className="bg-transparent p-0 h-auto">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-medium"
              >
                Course Overview
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-medium"
              >
                Ratings & Reviews
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-secondary/50 border-white/10 rounded-full text-sm"
              />
            </div>
          </div>

          <TabsContent value="overview" className="space-y-1">
            {/* Stats Header */}
            <div className="px-4 py-2 text-sm font-medium text-muted-foreground border-b border-dashed border-white/10 mb-2">
              {lessons.length} Contents
            </div>

            {filteredLessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className={`group flex items-center p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${lesson.is_completed ? 'opacity-75' : ''
                  }`}
                onClick={() => handleStartLesson(lesson.id)}
              >
                <div className="mr-4 text-muted-foreground font-mono text-sm opacity-50">#</div>

                <div className={`flex-1 font-medium ${lesson.is_completed ? 'text-primary' : ''}`}>
                  {lesson.title}
                </div>

                <div className={`
                            h-5 w-5 rounded-full border-2 flex items-center justify-center
                            ${lesson.is_completed ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}
                        `}>
                  {lesson.is_completed && <CheckCircle className="h-3 w-3" />}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="reviews">
            {/* Reviews Content from previous implementation, styled to match */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between p-6 bg-card border border-white/10 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">{avgRating || '0.0'}</div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${star <= Math.round(Number(avgRating))
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted-foreground/30'
                          }`}
                      />
                    ))}
                  </div>
                </div>
                {isEnrolled && (
                  <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Add Review</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex gap-2 justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="p-2 transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-8 w-8 ${star <= reviewRating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-muted-foreground/30'
                                  }`}
                              />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          placeholder="Write your review..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows={4}
                        />
                        <Button onClick={handleSubmitReview} className="w-full">
                          Submit Review
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews yet. Be the first to review!
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-card/50 border border-white/5 rounded-lg">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.profile?.avatar_url || undefined} />
                          <AvatarFallback>{review.profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{review.profile?.full_name || 'Anonymous'}</h4>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${star <= review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-muted-foreground/30'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-muted-foreground mt-2">{review.review_text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
