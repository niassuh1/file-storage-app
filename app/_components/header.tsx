"use client";
import { Button } from "@/components/ui/button";
import {
  OrganizationSwitcher,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { FC } from "react";

export const Header: FC = () => {
  return (
    <header className="border border-b bg-background/70 backdrop-blur-md sticky top-0">
      <nav className="flex items-center gap-3 w-full py-3 px-6 container mx-auto">
        <div className="mr-auto tracking-tighter font-semibold">Storage</div>
        <SignedOut>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <OrganizationSwitcher />
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
};
