
'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';

const publicPaths = ['/login'];

export function AuthInitializer() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return; // Wait until user status is determined

    const isPublicPath = publicPaths.includes(pathname);

    if (!user && !isPublicPath) {
      // If user is not logged in and not on a public page, redirect to login
      router.push('/login');
    } else if (user && isPublicPath) {
      // If user is logged in and on a public page (like login), redirect to home
      router.push('/');
    }
    // If user is logged in and on a private page, do nothing.
    // If user is not logged in and on a public page, do nothing.

  }, [user, isUserLoading, router, pathname]);

  // This component doesn't render anything to the DOM.
  return null;
}
