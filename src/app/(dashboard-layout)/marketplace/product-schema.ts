import { z } from "zod";

export const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string().optional(),
  thumbnail: z.string().optional(),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().optional(),
  rating: z.number().default(0),
  reviewCount: z.number().default(0),
  sellCount: z.number().default(0),
  category: z.string(),
  status: z.enum(["active", "blocked"]).default("active"),
});

export type Product = z.infer<typeof productSchema>;

// API Response types
export const apiProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string().optional(),
  thumbnail: z.string().optional(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
  }),
  rating: z.number(),
  reviewCount: z.number(),
  sellCount: z.number(),
  category: z.string(),
  status: z.enum(["active", "blocked"]).default("active"),
});

export type ApiProduct = z.infer<typeof apiProductSchema>;

// Detailed Product for View Details
export const apiProductDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
  rating: z.number(),
  reviewCount: z.number(),
  downloads: z.number(),
  sellCount: z.number(),
  author: z.object({
    name: z.string(),
    avatar: z.string().optional(),
    verified: z.boolean(),
    totalProducts: z.number(),
  }),
  image: z.string().optional(),
  thumbnail: z.string().optional(),
  imagePairs: z
    .array(
      z.object({
        before: z.string(),
        after: z.string(),
      })
    )
    .optional(),
  imageMetadata: z
    .object({
      width: z.number().optional(),
      format: z.string().optional(),
      height: z.number().optional(),
      fileSize: z.number().optional(),
      colorSpace: z.string().optional(),
      dimensions: z.string().optional(),
    })
    .optional(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  compatibility: z.array(z.string()).optional(),
  fileFormat: z.string().optional(),
  fileSize: z.string().optional(),
  includesCount: z.number().optional(),
  features: z.array(z.string()).optional(),
  specifications: z
    .object({
      adjustments: z.array(z.string()).optional(),
      bestFor: z.array(z.string()).optional(),
      difficulty: z.string().optional(),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  warranty: z
    .object({
      duration: z.string().optional(),
      coverage: z.string().optional(),
      terms: z.array(z.string()).optional(),
    })
    .optional(),
  reviews: z.array(z.any()).optional(),
});

export type ApiProductDetail = z.infer<typeof apiProductDetailSchema>;

// Transform API product to Product format
export function transformApiProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    title: apiProduct.title,
    description: apiProduct.description,
    price: apiProduct.price,
    image: apiProduct.image,
    thumbnail: apiProduct.thumbnail,
    authorId: apiProduct.author.id,
    authorName: apiProduct.author.name,
    authorAvatar: apiProduct.author.avatar,
    rating: apiProduct.rating,
    reviewCount: apiProduct.reviewCount,
    sellCount: apiProduct.sellCount,
    category: apiProduct.category,
    status: apiProduct.status,
  };
}
