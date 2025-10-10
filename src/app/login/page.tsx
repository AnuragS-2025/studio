
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
import { useAuth, useFirestore } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, getAdditionalUserInfo } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { MOCK_BUDGETS, MOCK_INVESTMENTS, MOCK_TRANSACTIONS } from "@/lib/data";

export default function LoginPage() {
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const addSampleData = async (userId: string) => {
        if (!firestore) return;
        
        const investmentsColRef = collection(firestore, 'users', userId, 'investments');
        const budgetsColRef = collection(firestore, 'users', userId, 'budgets');
        const transactionsColRef = collection(firestore, 'users', userId, 'transactions');

        const investmentPromises = MOCK_INVESTMENTS.map(investment => addDoc(investmentsColRef, investment));
        const budgetPromises = MOCK_BUDGETS.map(budget => addDoc(budgetsColRef, budget));
        const transactionPromises = MOCK_TRANSACTIONS.map(transaction => addDoc(transactionsColRef, transaction));

        await Promise.all([...investmentPromises, ...budgetPromises, ...transactionPromises]);
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            const additionalInfo = getAdditionalUserInfo(userCredential);
            if (additionalInfo?.isNewUser) {
                await addSampleData(userCredential.user.uid);
            }
            router.push('/');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message || "An unexpected error occurred during Google sign-in.",
            });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSigningIn(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (error: any) {
            let description = "An unexpected error occurred.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                description = "User Account not Found";
            } else if (error.code === 'auth/wrong-password') {
                description = "Incorrect password, Try Again!";
            } else {
                description = error.message;
            }
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: description,
            });
        } finally {
            setIsSigningIn(false);
        }
    };
    
    const handleEmailSignUp = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({
                variant: "destructive",
                title: "Sign-Up Failed",
                description: "Please enter both an email and a password.",
            });
            return;
        }
        setIsSigningUp(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await addSampleData(userCredential.user.uid);
            router.push('/');
        } catch (error: any) {
            let description = "An unexpected error occurred.";
            if (error.code === 'auth/email-already-in-use') {
                description = "An account with this email already exists. Please sign in.";
            } else if (error.code === 'auth/weak-password') {
                description = "The password is too weak. Please choose a stronger password (at least 6 characters).";
            } else if (error.code === 'auth/invalid-email') {
                description = "The email address is not valid. Please enter a valid email.";
            }
             else {
                description = error.message;
            }
            toast({
                variant: "destructive",
                title: "Sign-Up Failed",
                description: description,
            });
        } finally {
            setIsSigningUp(false);
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
                    <CardTitle className="text-2xl">Welcome</CardTitle>
                    <CardDescription>
                        Sign in or create an account to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <form onSubmit={handleEmailSignIn}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <Button className="w-full" type="submit" disabled={isSigningIn || isSigningUp || isGoogleLoading}>
                                {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                            No account?
                            </span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" type="button" onClick={handleEmailSignUp} disabled={isSigningIn || isSigningUp || isGoogleLoading}>
                        {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
