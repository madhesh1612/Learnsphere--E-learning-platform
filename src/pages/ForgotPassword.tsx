import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            // Redirect to a reset password page that we'll need to create later or use a default
            // For now, let's assume it redirects to a page where they can enter new password
            // typically /update-password or /reset-password
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) {
                throw error;
            }

            setIsSubmitted(true);
            toast.success('Password reset link sent to your email');
        } catch (error: any) {
            console.error('Error sending reset password email:', error);
            toast.error(error.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
            <div className="w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-glow">
                            <GraduationCap className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <span className="font-display text-2xl font-bold">LearnSphere</span>
                    </Link>
                </div>

                <Card className="shadow-xl border-0 bg-card/80 backdrop-blur">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-display">Forgot Password</CardTitle>
                        <CardDescription>
                            {!isSubmitted
                                ? "Enter your email address and we'll send you a link to reset your password"
                                : "Check your email for the reset link"}
                        </CardDescription>
                    </CardHeader>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-10 pl-9"
                                        />
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-4">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending Link...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
                                        <ArrowLeft className="mr-2 h-3 w-3" /> Back to Login
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    ) : (
                        <CardContent className="flex flex-col items-center space-y-4 pt-4">
                            <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center mb-2">
                                <Mail className="h-8 w-8 text-success" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Click the link in the email to set a new password.
                                </p>
                            </div>
                            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/login')}>
                                Return to Login
                            </Button>
                            <div className="text-center mt-4">
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-xs text-primary hover:underline bg-transparent border-0 cursor-pointer"
                                >
                                    Didn't receive the email? Try again
                                </button>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
