import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  PlayCircle, 
  Award, 
  Users, 
  BookOpen, 
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Rich Course Content',
      description: 'Learn through videos, documents, images, and interactive quizzes.',
    },
    {
      icon: PlayCircle,
      title: 'Full-Screen Player',
      description: 'Immersive learning experience with distraction-free player.',
    },
    {
      icon: Award,
      title: 'Earn Badges',
      description: 'Complete courses and quizzes to earn points and unlock achievements.',
    },
    {
      icon: Users,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and subject matter experts.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Students' },
    { value: '500+', label: 'Courses' },
    { value: '100+', label: 'Instructors' },
    { value: '4.9', label: 'Rating', icon: Star },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground/80 backdrop-blur">
              <GraduationCap className="h-4 w-4" />
              <span>Welcome to LearnSphere</span>
            </div>
            
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Unlock Your Potential with{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Expert Learning
              </span>
            </h1>
            
            <p className="mb-8 text-lg text-slate-300 lg:text-xl">
              Join thousands of learners mastering new skills. Access high-quality courses, 
              earn certifications, and transform your career.
            </p>
            
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="h-12 px-8 text-base shadow-glow"
                onClick={() => navigate(user ? '/courses' : '/signup')}
              >
                {user ? 'Browse Courses' : 'Get Started Free'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-slate-600 text-white hover:bg-slate-800"
                onClick={() => navigate('/courses')}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Explore Courses
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-display text-3xl font-bold text-white">{stat.value}</span>
                  {stat.icon && <stat.icon className="h-5 w-5 text-yellow-400 fill-yellow-400" />}
                </div>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Everything You Need to{' '}
              <span className="text-primary">Learn & Grow</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              LearnSphere provides all the tools you need for an exceptional learning experience.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ready to Start Learning?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join LearnSphere today and take the first step towards mastering new skills.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {user ? (
                <Button size="lg" onClick={() => navigate('/courses')}>
                  Browse All Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/signup')}>
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Benefits */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Free to get started</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Access on any device</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Earn certificates</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
