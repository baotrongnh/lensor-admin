"use client";

import * as React from "react";
import {
  IconUser,
  IconMail,
  IconFileText,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserService, ApiUser } from "@/services/user.service";

interface UserEditModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: () => void;
}

export function UserEditModal({
  userId,
  open,
  onOpenChange,
  onUserUpdated,
}: UserEditModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    bio: "",
    email: "",
  });

  React.useEffect(() => {
    if (open && userId) {
      fetchUserData();
    }
  }, [open, userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUserById(userId);
      setFormData({
        name: response.data.name || "",
        bio: "", // Bio không có trong API response, để trống
        email: response.data.email || "",
      });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load user data", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setSubmitting(true);
      await UserService.updateUser(userId, {
        name: formData.name,
        bio: formData.bio,
        email: formData.email,
      } as Partial<ApiUser>);

      toast.success("User updated successfully", {
        description: `${formData.name}'s information has been updated`,
      });

      onUserUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {loading ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center py-8">
                <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <IconUser className="size-4" />
                  Name
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter user name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <IconFileText className="size-4" />
                  Bio
                </Label>
                <Input
                  id="bio"
                  placeholder="Enter user bio (optional)"
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Short description about the user
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <IconMail className="size-4" />
                  Email
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <Separator />

              {/* Helper Text */}
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Note:</span> Fields marked with{" "}
                  <span className="text-red-500">*</span> are required. Changes
                  will be saved immediately after clicking the Save button.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || submitting}>
              {submitting ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
