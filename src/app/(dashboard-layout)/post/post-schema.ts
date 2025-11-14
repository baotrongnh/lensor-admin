import { z } from "zod";

export const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().optional(),
  status: z.enum(["Published", "Draft", "Archived"]).default("Draft"),
  category: z.string().optional(),
  views: z.number().default(0),
  likes: z.number().default(0),
  comments: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
});

export type Post = z.infer<typeof postSchema>;

// API Response types
export const apiPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().optional(),
  status: z.string(),
  category: z.string().optional(),
  views: z.number().optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
});

export type ApiPost = z.infer<typeof apiPostSchema>;

// Transform API post to Post format
export function transformApiPost(apiPost: ApiPost): Post {
  return {
    id: apiPost.id,
    title: apiPost.title,
    content: apiPost.content,
    authorId: apiPost.authorId,
    authorName: apiPost.authorName,
    authorAvatar: apiPost.authorAvatar,
    status: (apiPost.status as "Published" | "Draft" | "Archived") || "Draft",
    category: apiPost.category,
    views: apiPost.views || 0,
    likes: apiPost.likes || 0,
    comments: apiPost.comments || 0,
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt,
    publishedAt: apiPost.publishedAt,
  };
}
