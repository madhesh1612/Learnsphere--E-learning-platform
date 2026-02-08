import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Medal, Crown, Target } from 'lucide-react';
import { BADGE_LEVELS, getCurrentBadge, getNextBadge } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

export default function Achievements() {
    const { user } = useAuth();

    const { data: pointsData, isLoading } = useQuery({
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

    const totalPoints = pointsData?.total_points || 0;
    const currentBadge = getCurrentBadge(totalPoints);
    const nextBadge = getNextBadge(totalPoints);

    if (isLoading) {
        return (
            <div className="container py-8 space-y-8">
                <Skeleton className="h-12 w-48" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-display">Achievements</h1>
                <p className="text-muted-foreground mt-2">Track your learning progress and earn badges</p>
            </div>

            {/* Main Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                        <Star className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPoints}</div>
                        <p className="text-xs text-muted-foreground">Lifetime earned points</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
                        <Trophy className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <span className="text-2xl">{currentBadge.icon}</span>
                            {currentBadge.name}
                        </div>
                        <p className="text-xs text-muted-foreground">{currentBadge.points} points needed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {nextBadge ? nextBadge.name : 'Max Level!'}
                        </div>
                        {nextBadge && (
                            <div className="space-y-2 mt-2">
                                <Progress value={(totalPoints / nextBadge.points) * 100} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                    {nextBadge.points - totalPoints} more points to level up
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Badges List */}
            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Medal className="h-5 w-5" />
                    Badge Collection
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {BADGE_LEVELS.map((badge) => {
                        const isUnlocked = totalPoints >= badge.points;
                        return (
                            <Card
                                key={badge.name}
                                className={`transition-all ${isUnlocked
                                        ? 'border-primary/50 bg-primary/5'
                                        : 'opacity-60 grayscale bg-muted'
                                    }`}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="h-10 w-10 text-3xl flex items-center justify-center bg-background rounded-full shadow-sm">
                                            {badge.icon}
                                        </div>
                                        {isUnlocked && <Badge variant="secondary" className="bg-primary/20 text-primary">Unlocked</Badge>}
                                    </div>
                                    <CardTitle className="mt-4">{badge.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Unlocked at <span className="font-medium text-foreground">{badge.points}</span> points
                                    </p>
                                    {isUnlocked && (
                                        <div className="mt-3 flex items-center text-xs text-primary font-medium">
                                            <Crown className="h-3 w-3 mr-1" />
                                            Earned
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
