import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/hooks/useCourses';
import { KanbanCourseCard } from './KanbanCourseCard';

interface KanbanColumnProps {
    id: string;
    title: string;
    count: number;
    courses: Course[];
    onEdit: (course: Course) => void;
    onShare: (course: Course) => void;
    onDelete: (course: Course) => void;
}

export function KanbanColumn({ id, title, count, courses, onEdit, onShare, onDelete }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <Card className={`${isOver ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <Badge variant="secondary">{count}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div
                    ref={setNodeRef}
                    className="space-y-3 min-h-[400px]"
                >
                    <SortableContext
                        items={courses.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {courses.map((course) => (
                            <KanbanCourseCard
                                key={course.id}
                                course={course}
                                onEdit={onEdit}
                                onShare={onShare}
                                onDelete={onDelete}
                            />
                        ))}
                    </SortableContext>

                    {courses.length === 0 && (
                        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                            Drop courses here
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
