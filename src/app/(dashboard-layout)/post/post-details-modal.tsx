"use client";

import * as React from "react";
import {
  IconFileText,
  IconUser,
  IconCalendar,
  IconEye,
  IconHeart,
  IconMessage,
  IconPhoto,
  IconCamera,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PostService, ApiPost } from "@/services/post.service";

interface PostDetailsModalProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailsModal({
  postId,
  open,
  onOpenChange,
}: PostDetailsModalProps) {
  const [postDetails, setPostDetails] = React.useState<ApiPost | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && postId) {
      fetchPostDetails();
    }
  }, [open, postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const response = await PostService.getPostById(postId);
      setPostDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch post details:", error);
      toast.error("Failed to load post details", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    // If it's already formatted like "1 day ago", return as is
    if (dateString.includes("ago") || dateString.includes("Just now")) {
      return dateString;
    }
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getFullImageUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://14.169.52.232:3005";
    return `${baseUrl}${path}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileText className="size-5" />
            Post Details
          </DialogTitle>
          <DialogDescription>
            Complete information about the post including metadata
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        ) : postDetails ? (
          <div className="space-y-6">
            {/* Post Title & Author */}
            <div>
              <h3 className="text-2xl font-bold mb-3">{postDetails.title}</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={postDetails.user.avatarUrl} />
                    <AvatarFallback>
                      {getInitials(postDetails.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{postDetails.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(postDetails.createdAt)}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={postDetails.user.isFollowed ? "default" : "outline"}
                >
                  {postDetails.user.isFollowed ? "Following" : "Not Following"}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Post Image */}
            {(postDetails.imageUrl || postDetails.thumbnailUrl) && (
              <>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <IconPhoto className="size-4" />
                    Image
                  </h4>
                  <div className="w-full rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={getFullImageUrl(
                        postDetails.imageUrl || postDetails.thumbnailUrl
                      )}
                      alt={postDetails.title}
                      className="w-full h-auto object-contain max-h-[600px]"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                        const parent = img.parentElement;
                        if (parent) {
                          parent.innerHTML =
                            '<div class="flex items-center justify-center h-64 text-muted-foreground"><div class="text-center"><svg class="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p>Image failed to load</p></div></div>';
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {postDetails.imageUrl && (
                      <Badge variant="secondary">Original Image</Badge>
                    )}
                    {postDetails.thumbnailUrl && (
                      <Badge variant="outline">Thumbnail Available</Badge>
                    )}
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {getFullImageUrl(
                        postDetails.imageUrl || postDetails.thumbnailUrl
                      )}
                    </code>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Engagement Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border p-4 bg-gradient-to-br from-red-500/5 to-red-600/5">
                <IconHeart
                  className={`size-8 ${
                    postDetails.isLiked
                      ? "fill-current text-red-500"
                      : "text-red-500"
                  }`}
                />
                <div>
                  <p className="text-2xl font-bold">
                    {postDetails.voteCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Votes {postDetails.isLiked && "• You liked this"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4 bg-gradient-to-br from-green-500/5 to-green-600/5">
                <IconMessage className="size-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {postDetails.commentCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Post Content */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <IconFileText className="size-4" />
                Content
              </h4>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm whitespace-pre-wrap">
                  {postDetails.content}
                </p>
              </div>
            </div>

            {/* Image Metadata - Camera & Photo Information */}
            {postDetails.imageMetadata &&
              Object.keys(postDetails.imageMetadata).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <IconCamera className="size-4" />
                      Image Metadata
                    </h4>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {/* Camera Info */}
                      {postDetails.imageMetadata.cameraMake && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Camera
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.cameraMake}{" "}
                            {postDetails.imageMetadata.cameraModel}
                          </p>
                        </div>
                      )}

                      {/* Lens Info */}
                      {postDetails.imageMetadata.lensModel && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Lens
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.lensModel}
                          </p>
                        </div>
                      )}

                      {/* Focal Length */}
                      {postDetails.imageMetadata.focalLength && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Focal Length
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.focalLength}
                          </p>
                        </div>
                      )}

                      {/* Aperture */}
                      {postDetails.imageMetadata.aperture && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Aperture
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.aperture}
                          </p>
                        </div>
                      )}

                      {/* Shutter Speed */}
                      {postDetails.imageMetadata.shutterSpeed && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Shutter Speed
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.shutterSpeed}
                          </p>
                        </div>
                      )}

                      {/* ISO */}
                      {postDetails.imageMetadata.iso && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            ISO
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.iso}
                          </p>
                        </div>
                      )}

                      {/* Dimensions */}
                      {postDetails.imageMetadata.dimensions && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Dimensions
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.dimensions}
                          </p>
                        </div>
                      )}

                      {/* File Size */}
                      {postDetails.imageMetadata.fileSize && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            File Size
                          </p>
                          <p className="text-sm font-semibold">
                            {formatFileSize(postDetails.imageMetadata.fileSize)}
                          </p>
                        </div>
                      )}

                      {/* Format */}
                      {postDetails.imageMetadata.format && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Format
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.format}
                          </p>
                        </div>
                      )}

                      {/* White Balance */}
                      {postDetails.imageMetadata.whiteBalance && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            White Balance
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.whiteBalance}
                          </p>
                        </div>
                      )}

                      {/* Exposure Mode */}
                      {postDetails.imageMetadata.exposureMode && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Exposure Mode
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.exposureMode}
                          </p>
                        </div>
                      )}

                      {/* Software */}
                      {postDetails.imageMetadata.software && (
                        <div className="rounded-lg border p-3 space-y-1 md:col-span-2 lg:col-span-3">
                          <p className="text-xs font-medium text-muted-foreground">
                            Software
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.software}
                          </p>
                        </div>
                      )}

                      {/* Artist/Author */}
                      {postDetails.imageMetadata.artist && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Artist
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.artist}
                          </p>
                        </div>
                      )}

                      {/* Date Time Original */}
                      {postDetails.imageMetadata.dateTimeOriginal && (
                        <div className="rounded-lg border p-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Date Taken
                          </p>
                          <p className="text-sm font-semibold">
                            {postDetails.imageMetadata.dateTimeOriginal}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
