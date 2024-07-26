"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Check, FileUp, Loader } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name should not be empty" }).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList)
    .refine((files) => files.length > 0, "Required"),
});

export const FileUploadButton: FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { organization, isLoaded: isOrganizationLoaded } = useOrganization();
  const { isLoaded: isUserLoaded, user } = useUser();
  const createFile = useMutation(api.files.createFile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const fileRef = form.register("file");

  let orgId: string | null | undefined = null;
  if (isOrganizationLoaded && isUserLoaded) {
    orgId = organization?.id ?? user?.id;
  }

  async function fileUploadSubmit(value: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log(value);
    // Get upload url
    const postUrl = await generateUploadUrl({});
    const res = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": value.file[0].type },
      body: value.file[0],
    });

    const { storageId } = await res.json();
    if (!orgId) return;
    createFile({ name: value.name, orgId, fileId: storageId });

    form.reset();
    setIsLoading(false);
    setIsDialogOpen(false);
    toast.success(
      <div className="flex items-center gap-2 text-emerald-600 font-medium">
        <Check className="w-4 h-4" />
        File was uploaded successfully
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button className="flex gap-2">
            <FileUp className="w-4 h-4" />
            Upload file
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Upload file
            </DialogTitle>
            <DialogDescription>Upload your files here</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(fileUploadSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="File name here" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({}) => (
                  <FormItem>
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <Input {...fileRef} type="file" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isLoading} className="flex gap-3" type="submit">
                {isLoading && <Loader className="animate-spin duration-1500" />}
                Upload
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
