import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Course } from '@/hooks/useCourses';
import { formatDuration } from '@/lib/courseUtils';
import { Edit, Share2, Trash2, Eye, BookOpen, Clock, GripVertical } from 'lucide-react';

interface KanbanCourseCardProps {
    course: Course;
    onEdit: (course: Course) => void;
    onShare: (course: Course) => void;
    onDelete: (course: Course) => void;
}

export function KanbanCourseCard({ course, onEdit, onShare, onDelete }: KanbanCourseCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: course.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card ref={setNodeRef} style={style} className="cursor-move">
            <CardContent className="p-3">
                <div className="flex gap-2">
                    {/* Drag Handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="flex items-start pt-1 cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate mb-1">{course.title}</h4>

                        {/* Tags */}
                        {course.tags && course.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {course.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                                {course.tags.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                        +{course.tags.length - 2}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{course.views_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                <span>{course.lesson_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(course.total_duration)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(course);
                                }}
                            >
                                <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShare(course);
                                }}
                            >
                                <Share2 className="h-3 w-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(course);
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
