import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAdminCourses, useDeleteCourse, usePublishCourse, Course } from '@/hooks/useCourses';
import { AdminCourseRow } from '@/components/admin/AdminCourseRow';
import { KanbanBoard } from '@/components/courses/KanbanBoard';
import { copyToClipboard, getCourseUrl } from '@/lib/courseUtils';
import { PlusCircle, Loader2, Search, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'list' | 'kanban';

export default function AdminCourses() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

    const { data: courses, isLoading } = useAdminCourses();
    const deleteMutation = useDeleteCourse();
    const publishMutation = usePublishCourse();

    // Filter courses by search query
    const filteredCourses = courses?.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (course: Course) => {
        navigate(`/admin/courses/${course.id}/edit`);
    };

    const handleShare = async (course: Course) => {
        const url = getCourseUrl(course.id);
        try {
            await copyToClipboard(url);
            toast.success('Course link copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const handleDelete = (course: Course) => {
        setCourseToDelete(course);
    };

    const confirmDelete = () => {
        if (courseToDelete) {
            deleteMutation.mutate(courseToDelete.id);
            setCourseToDelete(null);
        }
    };

    const handleCreateCourse = () => {
        navigate('/admin/courses/new');
    };

    const handleStatusChange = async (courseId: string, newStatus: 'draft' | 'published') => {
        const isPublished = newStatus === 'published';
        publishMutation.mutate({ id: courseId, is_published: isPublished });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Courses</h1>
                    <p className="text-muted-foreground">Manage all courses in the system</p>
                </div>

                <Button onClick={handleCreateCourse}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Course
                </Button>
            </div>

            {/* Search and View Toggle */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses by title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-1 border rounded-md p-1">
                            <Button
                                size="sm"
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                                onClick={() => setViewMode('kanban')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Course List/Kanban */}
            <div>
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredCourses && filteredCourses.length > 0 ? (
                    viewMode === 'kanban' ? (
                        <KanbanBoard
                            courses={filteredCourses}
                            onEdit={handleEdit}
                            onShare={handleShare}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                        />
                    ) : (
                        <div className="space-y-4">
                            {filteredCourses.map((course) => (
                                <AdminCourseRow
                                    key={course.id}
                                    course={course}
                                    onShare={handleShare}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <p className="text-muted-foreground">
                                    {searchQuery ? 'No courses found matching your search.' : 'No courses yet.'}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={handleCreateCourse} className="mt-4">
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Create Your First Course
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Course</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone.
                            All lessons, quizzes, and enrollments will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
