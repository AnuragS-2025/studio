
'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export function AuthInitializer() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // When the component mounts and we are not in a loading state and there is no user,
    // then we want to sign the user in anonymously.
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  // This component doesn't render anything to the DOM.
  return null;
}
