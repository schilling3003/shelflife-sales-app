
'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User, type IdTokenResult } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  claims?: IdTokenResult['claims'];
}

export interface UserHookResult {
  user: UserProfile | null;
  firebaseUser: User | null; // The raw Firebase user object
  isUserLoading: boolean;
  userError: Error | null;
}

export const useUser = (): UserHookResult => {
  const auth = useAuth();
  const [userState, setUserState] = useState<UserHookResult>({
    user: null,
    firebaseUser: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({ user: null, firebaseUser: null, isUserLoading: false, userError: new Error("Auth service not available.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      if (currentFirebaseUser) {
        try {
          const idTokenResult = await currentFirebaseUser.getIdTokenResult();
          const userProfile: UserProfile = {
            uid: currentFirebaseUser.uid,
            email: currentFirebaseUser.email,
            displayName: currentFirebaseUser.displayName,
            photoURL: currentFirebaseUser.photoURL,
            claims: idTokenResult.claims,
          };
          setUserState({ user: userProfile, firebaseUser: currentFirebaseUser, isUserLoading: false, userError: null });
        } catch (error) {
          console.error("Error getting user claims:", error);
          const userProfile: UserProfile = {
             uid: currentFirebaseUser.uid,
            email: currentFirebaseUser.email,
            displayName: currentFirebaseUser.displayName,
            photoURL: currentFirebaseUser.photoURL,
          };
          setUserState({ user: userProfile, firebaseUser: currentFirebaseUser, isUserLoading: false, userError: error as Error });
        }
      } else {
        setUserState({ user: null, firebaseUser: null, isUserLoading: false, userError: null });
      }
    }, (error) => {
      console.error("Auth state listener error:", error);
      setUserState({ user: null, firebaseUser: null, isUserLoading: false, userError: error });
    });

    return () => unsubscribe();
  }, [auth]);

  return userState;
};
