"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";

export default function Home() {
  const { organization, isLoaded: isOrganizationLoaded } = useOrganization();
  const { isLoaded: isUserLoaded, user } = useUser();
  const createFile = useMutation(api.files.createFile);

  let orgId = null;
  if (isOrganizationLoaded && isUserLoaded) {
    orgId = organization?.id ?? user?.id;
  }
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  return (
    <main className="flex flex-col w-full max-w-screen-xl mx-auto min-h-screen px-6 py-3">
      <Button
        onClick={async () => {
          await createFile({
            name: "File",
            orgId: organization?.id ?? user?.id,
          });
        }}
      >
        Hello world
      </Button>
      {files?.map((file) => <div key={file._id}>{file.name}</div>)}
    </main>
  );
}
