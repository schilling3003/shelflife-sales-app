
"use client";

import { Package, UploadCloud, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";

export function Header({children}: {children?: React.ReactNode}) {
  const auth = useAuth();
  const { firebaseUser } = useUser();

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
       {children}
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6" />
        <h1 className="font-headline text-2xl font-semibold">
          <Link href="/">ShelfLife Sales</Link>
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Button disabled>
          <UploadCloud className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
        {firebaseUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar>
                  <AvatarImage src={firebaseUser.photoURL ?? ""} alt="User avatar" />
                  <AvatarFallback>
                    {firebaseUser.displayName?.[0] || firebaseUser.email?.[0] || <UserIcon />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>{firebaseUser.email ?? "Anonymous"}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
