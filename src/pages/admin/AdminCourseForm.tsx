import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCourse, useCreateCourse, useUpdateCourse, usePublishCourse } from '@/hooks/useCourses';
import { useInstructors } from '@/hooks/useUsers';
import { ArrowLeft, Save, Eye, Upload, X, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { CourseContentEditor } from '@/components/admin/CourseContentEditor';
import { QuizEditor } from '@/components/admin/QuizEditor';

interface CourseFormData {
    title: string;
    short_description: string;
    description: string;
    tags: string[];
    website_url: string;
    visibility: 'everyone' | 'signed_in';
    access_rule: 'open' | 'invitation' | 'payment';
    price: number | null;
    image_url: string | null;
    responsible_id: string;
}

export default function AdminCourseForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [isPublished, setIsPublished] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('content'); // Default to content as per wireframe emphasis

    const { data: course, isLoading: loadingCourse } = useCourse(id);
    const { data: instructors } = useInstructors();
    const createMutation = useCreateCourse();
    const updateMutation = useUpdateCourse();
    const publishMutation = usePublishCourse();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<CourseFormData>({
        defaultValues: {
            title: '',
            short_description: '',
            description: '',
            tags: [],
            website_url: '',
            visibility: 'everyone',
            access_rule: 'open',
            price: null,
            image_url: null,
            responsible_id: '',
        },
    });

    const accessRule = watch('access_rule');
    const imageUrl = watch('image_url');

    // Load course data when editing
    useEffect(() => {
        if (course) {
            reset({
                title: course.title,
                short_description: course.short_description || '',
                description: course.description || '',
                tags: course.tags || [],
                website_url: course.website_url || '',
                visibility: course.visibility,
                access_rule: course.access_rule,
                price: course.price,
                image_url: course.image_url,
                responsible_id: course.instructor_id || '', // Mapping instructor_id to responsible_id
            });
            setTags(course.tags || []);
            setIsPublished(course.is_published);
        }
    }, [course, reset]);

    const onSubmit = async (data: CourseFormData) => {
        // Validate website URL if published
        if (isPublished && !data.website_url) {
            toast.error('Website URL is required for published courses');
            // setActiveTab('options'); // Maybe swtich to tab if needed
            return;
        }

        const courseData = {
            ...data,
            tags,
            is_published: isPublished,
            instructor_id: data.responsible_id, // Map back
        };

        try {
            if (isEditing && id) {
                await updateMutation.mutateAsync({ id, ...courseData });
                toast.success('Course updated successfully');
            } else {
                const newCourse = await createMutation.mutateAsync(courseData as any);
                toast.success('Course created successfully');
                navigate(`/admin/courses/${newCourse.id}/edit`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save course');
        }
    };

    const handleTogglePublish = async (checked: boolean) => {
        if (!isEditing || !id) {
            setIsPublished(checked);
            return;
        }

        // Check if website URL is required
        if (checked && !watch('website_url')) {
            toast.error('Please add a website URL before publishing');
            return;
        }

        try {
            await publishMutation.mutateAsync({ id, is_published: checked });
            setIsPublished(checked);
        } catch (error) {
            toast.error('Failed to update publish status');
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            const newTags = [...tags, tagInput.trim()];
            setTags(newTags);
            setValue('tags', newTags);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        setValue('tags', newTags);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleImageUpload = () => {
        // Placeholder for image upload
        const url = prompt("Enter image URL");
        if (url) setValue('image_url', url);
    };


    if (loadingCourse && isEditing) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <span className="font-semibold text-foreground">LearnSphere</span>
                    <span>/</span>
                    <Link to="/admin/courses" className="hover:text-foreground">Courses</Link>
                    <span>/</span>
                    <span>{isEditing ? course?.title : 'New'}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => {
                            reset();
                            setTags([]);
                            setIsPublished(false);
                            navigate('/admin/courses/new');
                        }}>
                            New
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border px-3 py-1.5 rounded-md bg-card">
                            <span className="text-sm font-medium">Publish on website</span>
                            <Switch
                                checked={isPublished}
                                onCheckedChange={handleTogglePublish}
                            />
                        </div>
                        <Button variant="outline" onClick={() => isEditing && window.open(`/courses/${id}`, '_blank')} disabled={!isEditing}>
                            Preview
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Form Area */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-8 mb-8">
                    {/* Left: Title & Tags */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-muted-foreground">Course Title</Label>
                            <Input
                                id="title"
                                {...register('title', { required: 'Title is required' })}
                                className="text-2xl font-semibold h-auto py-2 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent placeholder:text-muted-foreground/30"
                                placeholder="e.g. Basics of Odoo CRM"
                            />
                            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags" className="text-muted-foreground">Tags</Label>
                            <div className="flex flex-wrap gap-2 items-center min-h-[40px] border-b">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                <Input
                                    id="tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="border-0 focus-visible:ring-0 w-32 h-8 px-0 bg-transparent placeholder:text-muted-foreground/50"
                                    placeholder="Add tag..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Image */}
                    <div className="flex flex-col gap-2">
                        <div
                            className="aspect-video bg-muted rounded-md border-2 border-dashed flex items-center justify-center relative group cursor-pointer overflow-hidden"
                            onClick={handleImageUpload}
                        >
                            {imageUrl ? (
                                <img src={imageUrl} alt="Course" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-4">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Course Image</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-medium">Change Image</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Responsible Field */}
                <div className="max-w-md mb-8">
                    <div className="grid grid-cols-[100px,1fr] items-center gap-4">
                        <Label className="text-right text-muted-foreground">Responsible:</Label>
                        <Select
                            value={watch('responsible_id')}
                            onValueChange={(val) => setValue('responsible_id', val)}
                        >
                            <SelectTrigger className="border-0 border-b rounded-none px-0 focus:ring-0 h-8">
                                <SelectValue placeholder="Select Instructor" />
                            </SelectTrigger>
                            <SelectContent>
                                {instructors?.map(instructor => (
                                    <SelectItem key={instructor.id} value={instructor.id}>
                                        {instructor.full_name || instructor.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                        <TabsTrigger
                            value="content"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-2"
                        >
                            Content
                        </TabsTrigger>
                        <TabsTrigger
                            value="description"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-2"
                        >
                            Description
                        </TabsTrigger>
                        <TabsTrigger
                            value="options"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-2"
                        >
                            Options
                        </TabsTrigger>
                        <TabsTrigger
                            value="quiz"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-2"
                        >
                            Quiz
                        </TabsTrigger>
                    </TabsList>

                    <div className="pt-6">
                        <TabsContent value="content" className="mt-0">
                            {isEditing && id ? (
                                <CourseContentEditor courseId={id} />
                            ) : (
                                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/10">
                                    Please save the course first to add content.
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="description" className="mt-0">
                            <Textarea
                                {...register('description')}
                                placeholder="Detailed course description..."
                                rows={15}
                                className="font-mono text-sm"
                            />
                        </TabsContent>

                        <TabsContent value="options" className="mt-0 space-y-6 max-w-2xl">
                            <div className="grid grid-cols-[150px,1fr] gap-4 items-center">
                                <Label className="text-right">Visibility</Label>
                                <Select
                                    value={watch('visibility')}
                                    onValueChange={(value: any) => setValue('visibility', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="everyone">Everyone (Public)</SelectItem>
                                        <SelectItem value="signed_in">Signed In Users Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-[150px,1fr] gap-4 items-center">
                                <Label className="text-right">Access Rule</Label>
                                <Select
                                    value={watch('access_rule')}
                                    onValueChange={(value: any) => setValue('access_rule', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open (Anyone can enroll)</SelectItem>
                                        <SelectItem value="invitation">Invitation Only</SelectItem>
                                        <SelectItem value="payment">Payment Required</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-[150px,1fr] gap-4 items-center">
                                <Label className="text-right">Website URL</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input {...register('website_url')} className="pl-9" placeholder="https://..." />
                                </div>
                            </div>

                            {accessRule === 'payment' && (
                                <div className="grid grid-cols-[150px,1fr] gap-4 items-center">
                                    <Label className="text-right">Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...register('price')}
                                        placeholder="0.00"
                                    />
                                </div>
                            )}

                        </TabsContent>

                        <TabsContent value="quiz" className="mt-0">
                            <QuizEditor />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
