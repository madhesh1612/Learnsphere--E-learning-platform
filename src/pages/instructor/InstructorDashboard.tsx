import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, PlusCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InstructorDashboard() {
    const { user } = useAuth();

    // Fetch instructor's courses
    const { data: courses } = useQuery({
        queryKey: ['instructor-courses', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data } = await supabase
                .from('courses')
                .select('*, enrollments(count)')
                .eq('instructor_id', user.id)
                .order('created_at', { ascending: false });
            return data || [];
        },
        enabled: !!user?.id,
    });

    const totalEnrollments = courses?.reduce((sum, course: any) => {
        return sum + (course.enrollments?.[0]?.count || 0);
    }, 0) || 0;

    const publishedCourses = courses?.filter((c: any) => c.is_published).length || 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
                <p className="text-muted-foreground">Manage your courses and track student progress</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courses?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">{publishedCourses} published</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEnrollments}</div>
                        <p className="text-xs text-muted-foreground">Across all courses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {courses?.reduce((sum, c: any) => sum + (c.views_count || 0), 0) || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Course page views</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Get started with course creation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Link to="/instructor/courses/new">
                        <Button className="w-full">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create New Course
                        </Button>
                    </Link>
                    <Link to="/instructor/courses">
                        <Button variant="outline" className="w-full">
                            <BookOpen className="h-4 w-4 mr-2" />
                            View All Courses
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Recent Courses */}
            {courses && courses.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Courses</CardTitle>
                        <CardDescription>Your latest course creations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {courses.slice(0, 5).map((course: any) => (
                                <div key={course.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{course.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {course.enrollments?.[0]?.count || 0} enrollments
                                        </p>
                                    </div>
                                    <Link to={`/instructor/courses/${course.id}`}>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
