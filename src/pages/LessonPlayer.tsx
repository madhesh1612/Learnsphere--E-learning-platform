import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  Play,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  Menu,
  Download,
  Trophy,
  Video
} from 'lucide-react';
import { formatDuration, getCurrentBadge, getNextBadge } from '@/lib/supabase';
import { toast } from 'sonner';
import QuizPlayer from '@/components/QuizPlayer';

// Interfaces remain the same
interface Lesson {
  id: string;
  title: string;
  description: string | null;
  lesson_type: string;
  content_url: string | null;
  duration: number;
  allow_download: boolean;
  sort_order: number;
  is_completed?: boolean;
}

interface Attachment {
  id: string;
  title: string;
  file_url: string | null;
  external_url: string | null;
  attachment_type: string;
}

interface Course {
  id: string;
  title: string;
}

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (courseId && lessonId) {
      fetchData();
    }
  }, [courseId, lessonId, user]);

  const fetchData = async () => {
    if (!courseId || !lessonId) return;

    try {
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', courseId)
        .single();
      setCourse(courseData);

      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order');

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
        setCurrentLesson(lessonsWithProgress.find(l => l.id === lessonId) || null);
      } else {
        setLessons(lessonsData || []);
        setCurrentLesson(lessonsData?.find(l => l.id === lessonId) || null);
      }

      if (user) {
        const { data: pointsData } = await supabase
          .from('user_points')
          .select('total_points')
          .eq('user_id', user.id)
          .maybeSingle();
        setTotalPoints(pointsData?.total_points || 0);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsCompleted = async () => {
    if (!user || !currentLesson) return;

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: currentLesson.id,
          is_completed: true,
          completed_at: new Date().toISOString(),
          progress_percentage: 100,
        });

      if (error) throw error;

      // Award points
      const pointsToAward = 10;
      const { error: pointsError } = await supabase
        .from('user_points')
        .upsert({ user_id: user.id, total_points: totalPoints + pointsToAward });

      if (!pointsError) {
        setEarnedPoints(pointsToAward);
        setTotalPoints(totalPoints + pointsToAward);
        setShowPointsPopup(true);
      }

      setLessons(prev => prev.map(l =>
        l.id === currentLesson.id ? { ...l, is_completed: true } : l
      ));
      setCurrentLesson(prev => prev ? { ...prev, is_completed: true } : null);

    } catch (error) {
      toast.error('Failed to mark as completed');
    }
  };

  const goToNextLesson = () => {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      navigate(`/lesson/${courseId}/${nextLesson.id}`);
    }
  };

  const completedCount = lessons.filter(l => l.is_completed).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
  const isLastLesson = currentIndex === lessons.length - 1;

  const currentBadge = getCurrentBadge(totalPoints);
  const nextBadge = getNextBadge(totalPoints);

  const renderContent = () => {
    if (!currentLesson) return null;

    if (currentLesson.lesson_type === 'quiz') {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px] w-full">
          {currentLesson.content_url ? (
            <QuizPlayer
              quizId={currentLesson.content_url}
              onComplete={(score, passed) => {
                if (passed) {
                  markAsCompleted();
                  toast.success(`Quiz passed with score ${score}!`);
                } else {
                  toast.error(`Quiz failed. Score: ${score}. Try again!`);
                }
              }}
            />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No quiz content available.
            </div>
          )}
        </div>
      );
    }

    // Existing render logic (simplified for wireframe focus)
    return (
      <div className="border border-white/10 rounded-xl overflow-hidden bg-card/50 h-full flex flex-col">
        {/* Header inside content area per wireframe */}
        <div className="p-4 border-b border-white/10 bg-black/20">
          <h2 className="font-semibold text-lg text-primary">{currentLesson.title}</h2>
        </div>

        <div className="flex-1 flex items-center justify-center bg-black/40 min-h-[400px] relative">
          {currentLesson.lesson_type === 'video' && (
            <div className="text-center">
              <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Video Player Placeholder</p>
            </div>
          )}
          {currentLesson.lesson_type === 'document' && (
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Document Viewer Placeholder</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-8"><Skeleton className="h-12 w-full" /></div>;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex flex-col border-r border-white/10 bg-card">
        <div className="p-4 space-y-4 border-b border-white/10">
          <Button
            variant="outline"
            size="sm"
            className="w-fit border-primary/50 text-primary hover:bg-primary/10"
            onClick={() => navigate(`/course/${courseId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div>
            <h3 className="font-bold line-clamp-1 mb-2">{course?.title}</h3>
            <Progress value={progressPercent} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">{progressPercent}% Completed</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => navigate(`/lesson/${courseId}/${lesson.id}`)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${lesson.id === currentLesson?.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'hover:bg-accent/50 text-muted-foreground'
                }`}
            >
              {/* Icon based on Type */}
              <div className="shrink-0">
                {lesson.lesson_type === 'video' && <Video className="h-4 w-4" />}
                {lesson.lesson_type === 'document' && <FileText className="h-4 w-4" />}
                {lesson.lesson_type === 'quiz' && <HelpCircle className="h-4 w-4" />}
              </div>

              <div className="flex-1 text-sm truncate">{lesson.title}</div>

              <div className="shrink-0">
                {lesson.is_completed ? (
                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-background relative">
        {/* Mobile Header Toggle */}
        <div className="md:hidden p-4 border-b border-white/10 flex items-center">
          <Menu className="h-6 w-6" />
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Content Description */}
          {currentLesson?.description && (
            <div className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm">
              {currentLesson.description}
            </div>
          )}

          {renderContent()}
        </div>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-white/10 flex justify-end bg-card">
          <Button
            size="lg"
            className="bg-primary/90 hover:bg-primary text-primary-foreground min-w-[200px]"
            onClick={() => {
              if (!currentLesson?.is_completed) markAsCompleted();
              if (!isLastLesson) goToNextLesson();
            }}
          >
            {isLastLesson ? 'Finish Course' : 'Next Content'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Points Popup - Kept same logic */}
      <Dialog open={showPointsPopup} onOpenChange={setShowPointsPopup}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Trophy className="h-16 w-16 mx-auto text-warning mb-4" />
              Bingo! You have earned!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="text-5xl font-bold text-primary mb-2">{earnedPoints} points</div>
            <p className="text-muted-foreground mb-4">Total: {totalPoints} points</p>
            <Button onClick={() => setShowPointsPopup(false)} className="w-full">
              Continue Learning
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
