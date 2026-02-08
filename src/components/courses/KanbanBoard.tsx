import { useMemo } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Course } from '@/hooks/useCourses';
import { KanbanColumn } from './KanbanColumn';
import { CourseCard } from './CourseCard';
import { useState } from 'react';

interface KanbanBoardProps {
    courses: Course[];
    onEdit: (course: Course) => void;
    onShare: (course: Course) => void;
    onDelete: (course: Course) => void;
    onStatusChange: (courseId: string, newStatus: 'draft' | 'published') => void;
}

export function KanbanBoard({ courses, onEdit, onShare, onDelete, onStatusChange }: KanbanBoardProps) {
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Group courses by status
    const { draftCourses, publishedCourses } = useMemo(() => {
        return {
            draftCourses: courses.filter(c => !c.is_published),
            publishedCourses: courses.filter(c => c.is_published),
        };
    }, [courses]);

    const handleDragStart = (event: DragStartEvent) => {
        const course = courses.find(c => c.id === event.active.id);
        setActiveCourse(course || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCourse(null);

        if (!over) return;

        const courseId = active.id as string;
        const newStatus = over.id as 'draft' | 'published';

        // Find the course
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        // Check if status actually changed
        const currentStatus = course.is_published ? 'published' : 'draft';
        if (currentStatus !== newStatus) {
            onStatusChange(courseId, newStatus);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-2 gap-6">
                {/* Draft Column */}
                <KanbanColumn
                    id="draft"
                    title="Draft"
                    count={draftCourses.length}
                    courses={draftCourses}
                    onEdit={onEdit}
                    onShare={onShare}
                    onDelete={onDelete}
                />

                {/* Published Column */}
                <KanbanColumn
                    id="published"
                    title="Published"
                    count={publishedCourses.length}
                    courses={publishedCourses}
                    onEdit={onEdit}
                    onShare={onShare}
                    onDelete={onDelete}
                />
            </div>

            <DragOverlay>
                {activeCourse && (
                    <div className="opacity-50">
                        <CourseCard
                            course={activeCourse}
                            onEdit={onEdit}
                            onShare={onShare}
                            onDelete={onDelete}
                            view="kanban"
                        />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
