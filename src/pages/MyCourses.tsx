import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CircularProgress } from '@/components/ui/circular-progress';
import {
  Search,
  BookOpen,
  Clock,
  Play,
  User,
  LogOut
} from 'lucide-react';
import { formatDuration, getCurrentBadge, getNextBadge, BADGE_LEVELS } from '@/lib/supabase';
import { toast } from 'sonner';

interface EnrolledCourse {
  id: string;
  course_id: string;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  status: string;
  course: {
    id: string;
    title: string;
    description: string | null; // Use description for wireframe match
    short_description: string | null;
    image_url: string | null;
    tags: string[];
    total_duration: number;
  };
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
}

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchEnrollments();
      fetchPoints();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      // Calculate progress for each enrollment
      const enrollmentsWithProgress = await Promise.all(
        (data || []).map(async (enrollment) => {
          const [lessonsRes, progressRes] = await Promise.all([
            supabase
              .from('lessons')
              .select('id', { count: 'exact' })
              .eq('course_id', enrollment.course_id),
            supabase
              .from('lesson_progress')
              .select('id', { count: 'exact' })
              .eq('user_id', user.id)
              .eq('is_completed', true)
              .in('lesson_id',
                (await supabase
                  .from('lessons')
                  .select('id')
                  .eq('course_id', enrollment.course_id)
                ).data?.map(l => l.id) || []
              ),
          ]);

          const totalLessons = lessonsRes.count || 0;
          const completedLessons = progressRes.count || 0;
          const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          return {
            ...enrollment,
            totalLessons,
            completedLessons,
            progress,
          };
        })
      );

      setEnrollments(enrollmentsWithProgress);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load your courses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPoints = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', user.id)
      .maybeSingle();

    setTotalPoints(data?.total_points || 0);
  };

  const currentBadge = getCurrentBadge(totalPoints);
  const nextBadge = getNextBadge(totalPoints);

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSignOutput = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (e) {
      toast.error('Failed to sign out');
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">LearnSphere</h1>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search course"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-secondary/50 border-white/10 rounded-full"
            />
          </div>

          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleSignOutput}>
            <span className="text-sm font-medium hidden sm:inline-block">Sign Out</span>
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-white/10">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8">
        {/* Main Content: Course Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold border-b border-white/10 pb-2 inline-block">My Courses</h2>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card border-white/5 overflow-hidden h-[300px]">
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg border-dashed border-white/10 bg-card/30">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-muted-foreground mt-1 mb-4">Start your learning journey today</p>
              <Button onClick={() => navigate('/browse')}>Browse Courses</Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredEnrollments.map((enrollment) => (
                <Card
                  key={enrollment.id}
                  className="bg-card border-white/10 overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors group relative"
                >
                  {/* Payment Badge - if applicable, logic needed */}
                  {/* <div className="absolute top-2 right-2 z-10">
                                <Badge className="bg-green-600 hover:bg-green-700">Paid</Badge>
                             </div> */}

                  <div className="relative h-40 bg-muted overflow-hidden">
                    {enrollment.course.image_url ? (
                      <img
                        src={enrollment.course.image_url}
                        alt={enrollment.course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-secondary/30">
                        <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <CardContent className="flex-1 p-4 flex flex-col gap-3">
                    <h3
                      className="font-semibold text-lg line-clamp-2 leading-tight cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/course/${enrollment.course_id}`)}
                    >
                      {enrollment.course.title}
                    </h3>

                    {enrollment.course.short_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {enrollment.course.short_description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-auto pt-2">
                      {enrollment.course.tags?.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-white/10 bg-secondary/20 font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-2">
                      {enrollment.progress === 0 ? (
                        <Button
                          size="sm"
                          className="w-fit bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
                          onClick={() => navigate(`/course/${enrollment.course_id}`)}
                        >
                          Start Course
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{enrollment.progress}% Complete</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-1.5" />
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => navigate(`/course/${enrollment.course_id}`)}
                          >
                            Continue Learning
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Profile */}
        <div className="space-y-8">
          <div className="border-b border-white/10 pb-2">
            <h2 className="text-xl font-semibold">My profile</h2>
          </div>

          <div className="flex flex-col items-center justify-center py-6 bg-card border border-white/10 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            <CircularProgress
              value={totalPoints}
              max={nextBadge ? nextBadge.points : totalPoints * 1.5}
              size={160}
              strokeWidth={8}
              className="mb-4"
              label={currentBadge.name}
              subLabel="Current Rank"
            >
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total</span>
                <span className="text-3xl font-bold">{totalPoints}</span>
                <span className="text-xs text-muted-foreground">Points</span>
                <span className="text-lg font-bold text-primary mt-2">{currentBadge.name}</span>
              </div>
            </CircularProgress>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Badges</h3>
            <div className="space-y-4">
              {BADGE_LEVELS.map((badge) => {
                const isUnlocked = totalPoints >= badge.points;
                return (
                  <div
                    key={badge.name}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isUnlocked
                        ? 'bg-card border-primary/20 shadow-sm'
                        : 'bg-transparent border-transparent opacity-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xl ${isUnlocked ? '' : 'grayscale'}`}>{badge.icon}</span>
                      <span className={`font-medium ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {badge.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">{badge.points} Points</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
