const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://14.169.52.232:3005";

export interface ApiProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  thumbnail?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  reviewCount: number;
  sellCount: number;
  category: string;
}

export interface ApiProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  downloads: number;
  sellCount: number;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
    totalProducts: number;
  };
  image?: string;
  thumbnail?: string;
  imagePairs?: Array<{
    before: string;
    after: string;
  }>;
  imageMetadata?: {
    width?: number;
    format?: string;
    height?: number;
    fileSize?: number;
    colorSpace?: string;
    dimensions?: string;
  };
  category: string;
  tags?: string[];
  compatibility?: string[];
  fileFormat?: string;
  fileSize?: string;
  includesCount?: number;
  features?: string[];
  specifications?: {
    adjustments?: string[];
    bestFor?: string[];
    difficulty?: string;
  };
  createdAt: string;
  updatedAt: string;
  warranty?: {
    duration?: string;
    coverage?: string;
    terms?: string[];
  };
  reviews?: any[];
}

export interface GetProductsResponse {
  data: ApiProduct[];
}

export interface SearchProductsResponse {
  data: ApiProduct[];
}

export interface GetProductResponse {
  data: ApiProductDetail;
}

export class ProductService {
  private static async fetchWithAuth(url: string, options: RequestInit = {}) {
    // Only access localStorage in browser environment
    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("access_token");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Request failed" }));
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      // Log the full error for debugging
      console.error("Fetch error:", {
        url,
        error,
        message: error instanceof Error ? error.message : "Unknown error",
      });

      // Re-throw with more context
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          `Cannot connect to API at ${url}. Please check:\n` +
            `1. The API server is running\n` +
            `2. The endpoint URL is correct\n` +
            `3. CORS is properly configured`
        );
      }

      throw error;
    }
  }

  /**
   * Get all products with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 50)
   */
  static async getAllProducts(
    page: number = 1,
    limit: number = 50
  ): Promise<GetProductsResponse> {
    const url = `${API_BASE_URL}/products?page=${page}&limit=${limit}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Search products by title
   * @param query - Search query
   * @param limit - Max results (default: 20)
   */
  static async searchProducts(
    query: string,
    limit: number = 20
  ): Promise<SearchProductsResponse> {
    const url = `${API_BASE_URL}/products/search?q=${encodeURIComponent(
      query
    )}&limit=${limit}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Get product by ID
   * @param id - Product UUID
   */
  static async getProductById(id: string): Promise<GetProductResponse> {
    const url = `${API_BASE_URL}/products/${id}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Delete product (Admin only)
   * @param id - Product UUID
   */
  static async deleteProduct(id: string): Promise<{ success: boolean }> {
    const url = `${API_BASE_URL}/products/${id}`;
    return this.fetchWithAuth(url, {
      method: "DELETE",
    });
  }

  /**
   * Delete multiple products (Admin only)
   * @param ids - Array of product UUIDs
   */
  static async deleteProducts(
    ids: string[]
  ): Promise<{ success: boolean; deleted: number }> {
    const results = await Promise.allSettled(
      ids.map((id) => this.deleteProduct(id))
    );

    const deleted = results.filter((r) => r.status === "fulfilled").length;

    return {
      success: deleted === ids.length,
      deleted,
    };
  }
}
