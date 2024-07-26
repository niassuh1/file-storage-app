"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import {
  Image as ImageIcon,
  Loader,
  MoreVertical,
  Share2Icon,
  TrashIcon,
} from "lucide-react";
import { FC, use, useState } from "react";

interface IFileCardProps {
  file: Doc<"files">;
}

export const FileCard: FC<IFileCardProps> = ({ file }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ImageIcon className="w-4 h-4" />
                {file.name}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-md">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDialogOpen(true)}
                    className="flex gap-2 text-destructive hover:!text-destructive cursor-pointer"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex gap-2 cursor-pointer">
                    <Share2Icon className="w-4 h-4" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-center bg-foreground/10 w-full h-64 rounded-md">
              <ImageIcon className="w-8 h-8 opacity-30 " />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs font-medium text-muted-foreground">
            Created by you
          </div>
        </CardContent>
        <CardFooter>
          <Button className="mx-auto">Download</Button>
        </CardFooter>
      </Card>

      <FileDeleteDialog
        file={file}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
        }}
      />
    </>
  );
};

interface IFileDeleteDialog {
  file: Doc<"files">;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const FileDeleteDialog: FC<IFileDeleteDialog> = ({
  file,
  open,
  onOpenChange,
}) => {
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const { organization } = useOrganization();
  const { user } = useUser();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base">
            Are you sure you wannna delete <b>{file.name}</b>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Once you delete the file, it will be transferred to trash.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <Label>File name</Label>
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Enter <b className="text-foreground">{file.name}</b> to confirtm
        </span>
        <div className="flex justify-self-end gap-2">
          <Button
            disabled={isLoading}
            onClick={() => {
              // Close
              onOpenChange && onOpenChange(!open ?? false);
              setFileName("");
            }}
            variant="outline"
          >
            Cancel
          </Button>

          <Button
            disabled={fileName !== file.name || isLoading}
            className="flex gap-2"
            variant={"outline-destructive"}
            onClick={async () => {
              setIsLoading(true);
              await deleteFile({
                fileId: file._id,
                orgId: organization?.id! ?? user?.id!,
                storageId: file.fileId as any,
              });
              // Close dialog
              onOpenChange && onOpenChange(!open ?? false);
              setIsLoading(false);
            }}
          >
            {isLoading && (
              <Loader className="w-4 h-4 animate-spin duration-1500" />
            )}
            Delete
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
