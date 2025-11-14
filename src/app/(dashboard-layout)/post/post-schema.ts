import { z } from "zod";

export const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().optional(),
  voteCount: z.number().default(0),
  isLiked: z.boolean().default(false),
  commentCount: z.number().default(0),
  isFollowed: z.boolean().default(false),
  createdAt: z.string(),
});

export type Post = z.infer<typeof postSchema>;

// API Response types
export const apiPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  imageMetadata: z.record(z.string(), z.any()).optional(),
  voteCount: z.number(),
  isLiked: z.boolean(),
  commentCount: z.number(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    isFollowed: z.boolean(),
  }),
});

export type ApiPost = z.infer<typeof apiPostSchema>;

// Transform API post to Post format
export function transformApiPost(apiPost: ApiPost): Post {
  return {
    id: apiPost.id,
    title: apiPost.title,
    content: apiPost.content,
    authorId: apiPost.user.id,
    authorName: apiPost.user.name,
    authorAvatar: apiPost.user.avatarUrl,
    voteCount: apiPost.voteCount,
    isLiked: apiPost.isLiked,
    commentCount: apiPost.commentCount,
    isFollowed: apiPost.user.isFollowed,
    createdAt: apiPost.createdAt,
  };
}
