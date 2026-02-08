import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Trophy, TrendingUp, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LearnerDashboard() {
    const { user } = useAuth();

    // Fetch enrolled courses
    const { data: enrollments } = useQuery({
        queryKey: ['learner-enrollments', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data } = await supabase
                .from('enrollments')
                .select('*, courses(*)')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('enrolled_at', { ascending: false });
            return data || [];
        },
        enabled: !!user?.id,
    });

    // Fetch user points
    const { data: pointsData } = useQuery({
        queryKey: ['user-points', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data } = await supabase
                .from('user_points')
                .select('total_points')
                .eq('user_id', user.id)
                .single();
            return data;
        },
        enabled: !!user?.id,
    });

    // Fetch user badges
    const { data: badges } = useQuery({
        queryKey: ['user-badges', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data } = await supabase
                .from('user_badges')
                .select('*, badges(*)')
                .eq('user_id', user.id)
                .order('awarded_at', { ascending: false });
            return data || [];
        },
        enabled: !!user?.id,
    });

    const inProgressCourses = enrollments?.filter((e: any) => !e.completed_at) || [];
    const completedCourses = enrollments?.filter((e: any) => e.completed_at) || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Welcome Back!</h1>
                <p className="text-muted-foreground">Continue your learning journey</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {completedCourses.length} completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pointsData?.total_points || 0}</div>
                        <p className="text-xs text-muted-foreground">{badges?.length || 0} badges earned</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progress</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {enrollments?.length ? Math.round((completedCourses.length / enrollments.length) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Completion rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Continue Learning */}
            {inProgressCourses.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Continue Learning</CardTitle>
                        <CardDescription>Pick up where you left off</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {inProgressCourses.slice(0, 3).map((enrollment: any) => (
                                <div key={enrollment.id} className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium">{enrollment.courses.title}</p>
                                        <Progress value={0} className="mt-2" />
                                    </div>
                                    <Link to={`/course/${enrollment.course_id}`}>
                                        <Button size="sm">
                                            <Play className="h-4 w-4 mr-2" />
                                            Continue
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Badges */}
            {badges && badges.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Achievements</CardTitle>
                        <CardDescription>Your latest badges</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 flex-wrap">
                            {badges.slice(0, 6).map((badge: any) => (
                                <Badge key={badge.id} variant="secondary" className="text-lg py-2 px-3">
                                    {badge.badges.icon} {badge.badges.name}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Explore More</CardTitle>
                    <CardDescription>Discover new courses</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link to="/learner/browse">
                        <Button className="w-full">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Browse All Courses
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
