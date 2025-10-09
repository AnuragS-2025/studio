
'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message || "An unexpected error occurred during Google sign-in.",
            });
            setIsGoogleLoading(false);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "The email or password you entered is incorrect. Please try again.",
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
            {/* Background Grid */}
            <div className="absolute inset-0 z-[-1] h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center">
                        <Icons.logo className="h-8 w-8 mb-2" />
                    </div>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to access your financial dashboard
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleEmailSignIn}>
                    <CardContent className="grid gap-4">
                        <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
                            {isGoogleLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                                    <path
                                        fill="currentColor"
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.66 1.67-3.86 0-6.99-3.14-6.99-7s3.13-7 6.99-7c2.03 0 3.36.79 4.31 1.74l2.77-2.77C18.04 2.45 15.51 1 12.48 1 5.88 1 1 5.98 1 12.5s4.88 11.5 11.48 11.5c3.54 0 6.1-1.23 8.04-3.1 2.02-1.95 2.6-4.82 2.6-7.39 0-.6-.05-1.19-.16-1.74Z"
                                    ></path>
                                </svg>
                            )}
                            Google
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                                </span>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
