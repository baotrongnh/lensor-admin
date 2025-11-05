import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
  role: z.enum(["Admin", "Manager", "User", "Editor", "Viewer"]),
  status: z.enum(["Active", "Inactive", "Suspended"]),
  createdAt: z.string(),
  lastLogin: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
