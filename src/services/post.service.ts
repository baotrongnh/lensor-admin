const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://14.169.52.232:3005";

export interface ApiPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  status: string;
  category?: string;
  views?: number;
  likes?: number;
  comments?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface GetPostsResponse {
  data: {
    posts: ApiPost[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface SearchPostsResponse {
  data: ApiPost[];
}

export interface GetPostResponse {
  data: ApiPost;
}

export interface PostStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

export interface GetPostStatsResponse {
  data: PostStats;
}

export class PostService {
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
  }

  /**
   * Get all posts with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 50, max: 1000)
   */
  static async getAllPosts(
    page: number = 1,
    limit: number = 50
  ): Promise<GetPostsResponse> {
    const url = `${API_BASE_URL}/posts?page=${page}&limit=${limit}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Search posts by title or content
   * @param query - Search query
   * @param limit - Max results (default: 20)
   */
  static async searchPosts(
    query: string,
    limit: number = 20
  ): Promise<SearchPostsResponse> {
    const url = `${API_BASE_URL}/posts/search?q=${encodeURIComponent(
      query
    )}&limit=${limit}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Get post by ID
   * @param id - Post UUID
   */
  static async getPostById(id: string): Promise<GetPostResponse> {
    const url = `${API_BASE_URL}/posts/${id}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Get post statistics
   * @param id - Post UUID
   */
  static async getPostStats(id: string): Promise<GetPostStatsResponse> {
    const url = `${API_BASE_URL}/posts/${id}/stats`;
    return this.fetchWithAuth(url);
  }

  /**
   * Update post by ID (Admin only)
   * @param id - Post UUID
   * @param data - Post data to update
   */
  static async updatePost(
    id: string,
    data: Partial<ApiPost>
  ): Promise<GetPostResponse> {
    const url = `${API_BASE_URL}/posts/${id}`;
    return this.fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete post (Admin only)
   * @param id - Post UUID
   */
  static async deletePost(id: string): Promise<{ success: boolean }> {
    const url = `${API_BASE_URL}/posts/${id}`;
    return this.fetchWithAuth(url, {
      method: "DELETE",
    });
  }

  /**
   * Delete multiple posts (Admin only)
   * @param ids - Array of post UUIDs
   */
  static async deletePosts(
    ids: string[]
  ): Promise<{ success: boolean; deleted: number }> {
    const results = await Promise.allSettled(
      ids.map((id) => this.deletePost(id))
    );

    const deleted = results.filter((r) => r.status === "fulfilled").length;

    return {
      success: deleted === ids.length,
      deleted,
    };
  }
}
