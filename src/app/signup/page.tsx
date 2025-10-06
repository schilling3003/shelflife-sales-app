
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { setDoc, doc } from "firebase/firestore";

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { firebaseUser, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    if (!isUserLoading && firebaseUser) {
      router.push("/");
    }
  }, [firebaseUser, isUserLoading, router]);

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName) {
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: "Please fill out all fields.",
      });
      return;
    }
    setIsSigningUp(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      // Also update the user's profile in Firebase Auth
      await updateProfile(newUser, {
        displayName: `${firstName} ${lastName}`.trim(),
      });


      if (newUser && firestore) {
        const userDocRef = doc(firestore, "users", newUser.uid);
        // Use await with setDoc to ensure the document is created before redirecting.
        await setDoc(userDocRef, {
          id: newUser.uid,
          firstName,
          lastName,
          email: newUser.email,
        });
      }
      
    } catch (error) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address.";
            break;
          case "auth/email-already-in-use":
            errorMessage = "This email address is already in use.";
            break;
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters long.";
            break;
          default:
            errorMessage = "Sign-up failed. Please try again.";
            break;
        }
      }
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: errorMessage,
      });
      setIsSigningUp(false);
    }
  };

  if (isUserLoading || firebaseUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your details to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                placeholder="Max"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSigningUp}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                placeholder="Robinson"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSigningUp}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSigningUp}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSigningUp}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full"
            onClick={handleSignUp}
            disabled={isSigningUp}
          >
            {isSigningUp ? "Signing Up..." : "Sign Up"}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
