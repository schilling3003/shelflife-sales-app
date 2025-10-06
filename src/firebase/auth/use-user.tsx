
'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User, type IdTokenResult } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

export interface UserWithClaims extends User {
  claims?: IdTokenResult['claims'];
}

export interface UserHookResult {
  user: UserWithClaims | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const useUser = (): UserHookResult => {
  const auth = useAuth();
  const [userState, setUserState] = useState<UserHookResult>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({ user: null, isUserLoading: false, userError: new Error("Auth service not available.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const userWithClaims: UserWithClaims = {
            ...firebaseUser,
            claims: idTokenResult.claims,
          };
          setUserState({ user: userWithClaims, isUserLoading: false, userError: null });
        } catch (error) {
          console.error("Error getting user claims:", error);
          // If claims fail, still provide the user object
          setUserState({ user: firebaseUser, isUserLoading: false, userError: error as Error });
        }
      } else {
        setUserState({ user: null, isUserLoading: false, userError: null });
      }
    }, (error) => {
      console.error("Auth state listener error:", error);
      setUserState({ user: null, isUserLoading: false, userError: error });
    });

    return () => unsubscribe();
  }, [auth]);

  return userState;
};

