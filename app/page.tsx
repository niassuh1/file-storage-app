"use client";

import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

import { FileUploadButton } from "./_components/file-upload-button";
import { FileCard } from "./_components/file-card";

export default function Home() {
  const { organization, isLoaded: isOrganizationLoaded } = useOrganization();
  const { isLoaded: isUserLoaded, user } = useUser();

  let orgId: string | null | undefined = null;
  if (isOrganizationLoaded && isUserLoaded) {
    orgId = organization?.id ?? user?.id;
  }
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  return (
    <main className="space-y-6 container mx-auto min-h-screen px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl  lg:text-4xl font-bold">Your Files</h1>
        <FileUploadButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {files?.map((file) => <FileCard file={file} key={file._id} />)}
      </div>
    </main>
  );
}
