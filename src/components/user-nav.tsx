
'use client';
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserData } from "@/lib/data"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UpdateProfileForm } from "./update-profile-form";

export function UserNav() {
  const { user: authUser, isUserLoading } = useUser();
  const { user: userData } = useUserData();
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
  const auth = useAuth();
  const router = useRouter();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);


  const handleSignOut = async () => {
    try {
        await signOut(auth);
        router.push('/login');
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ')
    if (names.length > 1 && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`
    }
    return name.substring(0, 2)
  }

  const user = authUser ? { name: authUser.displayName || 'Anonymous User', email: authUser.email || '' } : userData;

  if (isUserLoading) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  if(!authUser) {
    return (
        <Button asChild>
            <Link href="/login">Login</Link>
        </Button>
    )
  }

  return (
    <>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
                {authUser?.photoURL ? <AvatarImage src={authUser.photoURL} alt={user.name} /> : userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user.name} />}
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                {user.email}
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setProfileModalOpen(true)}>
                Update Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
                Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
                Settings
            </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
            Log out
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
        <UpdateProfileForm open={isProfileModalOpen} onOpenChange={setProfileModalOpen} />
    </>
  )
}
