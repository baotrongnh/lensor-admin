import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
  role: z
    .enum(["Admin", "Manager", "User", "Editor", "Viewer"])
    .default("User"),
  status: z.enum(["Active", "Inactive", "Suspended"]).default("Active"),
  createdAt: z.string(),
  lastLogin: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

// API Response types
export const apiUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  emailConfirmedAt: z.string().optional(),
  lastSignInAt: z.string().optional(),
});

export type ApiUser = z.infer<typeof apiUserSchema>;

// Transform API user to User format
export function transformApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    avatar: apiUser.avatarUrl,
    role: "User", // Default role, update based on your API
    status: apiUser.emailConfirmedAt ? "Active" : "Inactive",
    createdAt: apiUser.createdAt,
    lastLogin: apiUser.lastSignInAt,
  };
}
