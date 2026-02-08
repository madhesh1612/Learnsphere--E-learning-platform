import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstructorCourses } from '@/hooks/useInstructorCourses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, MoreVertical, BookOpen, Users, Edit, Trash, Eye, EyeOff } from 'lucide-react';

export default function InstructorCourses() {
    const navigate = useNavigate();
    const { courses, isLoading, updateCourse, deleteCourse } = useInstructorCourses();
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const filteredCourses = courses?.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleTogglePublish = (course: any) => {
        updateCourse.mutate({
            id: course.id,
            is_published: !course.is_published
        });
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteCourse.mutate(deleteId);
            setDeleteId(null);
        }
    };

    return (
        <div className="container py-8 bg-background min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-display">My Courses</h1>
                    <p className="text-muted-foreground mt-1">Manage your courses and content</p>
                </div>
                <Button onClick={() => navigate('/instructor/courses/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Course
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md mb-8">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Course Grid */}
            {isLoading ? (
                <div>Loading courses...</div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No courses found</h3>
                    <p className="text-muted-foreground mb-4">Get started by creating your first course</p>
                    <Button onClick={() => navigate('/instructor/courses/new')}>Create Course</Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course) => (
                        <Card key={course.id} className="group overflow-hidden hover:shadow-lg transition-all">
                            <div className="relative aspect-video bg-muted">
                                {course.image_url ? (
                                    <img
                                        src={course.image_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                                        <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant={course.is_published ? "default" : "secondary"}>
                                        {course.is_published ? "Published" : "Draft"}
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader className="pb-2">
                                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                            </CardHeader>

                            <CardContent className="pb-2">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        {course.lessonCount} Lessons
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {course.studentCount} Students
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between pt-4 border-t">
                                <Button variant="outline" size="sm" onClick={() => navigate(`/instructor/courses/${course.id}`)}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleTogglePublish(course)}>
                                            {course.is_published ? (
                                                <><EyeOff className="mr-2 h-4 w-4" /> Unpublish</>
                                            ) : (
                                                <><Eye className="mr-2 h-4 w-4" /> Publish</>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => setDeleteId(course.id)}
                                        >
                                            <Trash className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the course and all its lessons.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
