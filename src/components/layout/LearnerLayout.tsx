import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, LayoutDashboard, BookOpen, LogOut, Search, Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function LearnerLayout() {
    const { signOut, profile, user } = useAuth();
    const navigate = useNavigate();

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

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/learner" className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                <GraduationCap className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="font-display text-xl font-bold">LearnSphere</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="gap-1">
                                <Trophy className="h-3 w-3" />
                                {pointsData?.total_points || 0} points
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {profile?.full_name || profile?.email}
                            </span>
                            <Button variant="outline" size="sm" onClick={handleSignOut}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className="w-64 shrink-0">
                        <nav className="space-y-2">
                            <Link to="/learner">
                                <Button variant="ghost" className="w-full justify-start">
                                    <LayoutDashboard className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link to="/learner/browse">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Search className="h-4 w-4 mr-2" />
                                    Browse Courses
                                </Button>
                            </Link>
                            <Link to="/learner/my-courses">
                                <Button variant="ghost" className="w-full justify-start">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    My Courses
                                </Button>
                            </Link>
                            <Link to="/learner/achievements">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Achievements
                                </Button>
                            </Link>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
