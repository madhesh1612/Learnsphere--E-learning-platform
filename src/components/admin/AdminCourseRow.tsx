import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Course } from '@/hooks/useCourses';
import { formatDuration } from '@/lib/courseUtils';
import { Edit, Share2, Eye, FileText, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminCourseRowProps {
    course: Course;
    onShare: (course: Course) => void;
}

export function AdminCourseRow({ course, onShare }: AdminCourseRowProps) {
    const navigate = useNavigate();

    return (
        <div className="group relative bg-card border rounded-lg p-4 transition-all hover:shadow-md">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">

                {/* Left: Image & Title */}
                <div className="flex gap-4 flex-1 min-w-0">
                    {/* Course Image */}
                    <div className="shrink-0">
                        {course.image_url ? (
                            <img
                                src={course.image_url}
                                alt={course.title}
                                className="w-24 h-16 object-cover rounded-md border"
                            />
                        ) : (
                            <div className="w-24 h-16 bg-muted rounded-md border flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                        )}
                    </div>

                    {/* Title & Tags */}
                    <div className="flex flex-col justify-between min-w-0">
                        <h3
                            className="font-semibold text-lg truncate text-primary cursor-pointer hover:underline"
                            onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                        >
                            {course.title}
                        </h3>

                        {/* Tags */}
                        {course.tags && course.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {course.tags.map((tag, index) => (
                                    <span key={index} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle: Stats */}
                <div className="flex gap-8 text-sm text-muted-foreground shrink-0 border-l pl-6 md:border-l-0 md:pl-0">
                    <div className="flex flex-col gap-1 w-24">
                        <div className="flex items-center justify-between">
                            <span>Views</span>
                            <span className="font-medium text-foreground">{course.views_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Contents</span>
                            <span className="font-medium text-foreground">{course.lesson_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Duration</span>
                            <span className="font-medium text-foreground">{formatDuration(course.total_duration || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions & Status */}
                <div className="flex flex-col gap-2 shrink-0 items-end min-w-[120px]">
                    {/* Published Badge - Styled as angled ribbon or simple badge */}
                    <div className="mb-1">
                        {course.is_published ? (
                            <Badge className="bg-green-600 hover:bg-green-700">Published</Badge>
                        ) : (
                            <Badge variant="secondary">Draft</Badge>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onShare(course)}
                            className="h-8"
                        >
                            <Share2 className="h-3.5 w-3.5 mr-1" />
                            Share
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                            className="h-8"
                        >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
