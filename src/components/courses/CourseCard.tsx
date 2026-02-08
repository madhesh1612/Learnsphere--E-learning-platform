import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Course } from '@/hooks/useCourses';
import { formatDuration } from '@/lib/courseUtils';
import { Edit, Share2, Trash2, Eye, BookOpen, Clock } from 'lucide-react';

interface CourseCardProps {
    course: Course;
    onEdit: (course: Course) => void;
    onShare: (course: Course) => void;
    onDelete: (course: Course) => void;
    view?: 'kanban' | 'list';
}

export function CourseCard({ course, onEdit, onShare, onDelete, view = 'list' }: CourseCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    {/* Course Image */}
                    <div className="shrink-0">
                        {course.image_url ? (
                            <img
                                src={course.image_url}
                                alt={course.title}
                                className="w-24 h-24 object-cover rounded-md"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{course.title}</h3>
                                {course.short_description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {course.short_description}
                                    </p>
                                )}
                            </div>

                            {/* Published Badge */}
                            {course.is_published && (
                                <Badge variant="default" className="bg-green-600 shrink-0">
                                    Published
                                </Badge>
                            )}
                        </div>

                        {/* Tags */}
                        {course.tags && course.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {course.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{course.views_count} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{course.lesson_count || 0} lessons</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatDuration(course.total_duration)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(course)}
                            >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onShare(course)}
                            >
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onDelete(course)}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
