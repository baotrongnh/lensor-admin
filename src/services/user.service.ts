const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://14.169.52.232:3005";

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  emailConfirmedAt?: string;
  lastSignInAt?: string;
}

export interface GetUsersResponse {
  data: {
    users: ApiUser[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface SearchUsersResponse {
  data: ApiUser[];
}

export interface GetUserResponse {
  data: ApiUser;
}

export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface GetUserStatsResponse {
  data: UserStats;
}

export class UserService {
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
   * Get all users with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 50, max: 1000)
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 50
  ): Promise<GetUsersResponse> {
    const url = `${API_BASE_URL}/users?page=${page}&limit=${limit}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Search users by email or name
   * @param query - Search query (email or name)
   * @param limit - Max results (default: 20)
   */
  static async searchUsers(
    query: string,
    limit: number = 20
  ): Promise<SearchUsersResponse> {
    const url = `${API_BASE_URL}/users/search?q=${encodeURIComponent(
      query
    )}&limit=${limit}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Get user by ID
   * @param id - User UUID
   */
  static async getUserById(id: string): Promise<GetUserResponse> {
    const url = `${API_BASE_URL}/users/${id}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Get user statistics
   * @param id - User UUID
   */
  static async getUserStats(id: string): Promise<GetUserStatsResponse> {
    const url = `${API_BASE_URL}/users/${id}/stats`;
    return this.fetchWithAuth(url);
  }

  /**
   * Update user by ID (Admin only)
   * @param id - User UUID
   * @param data - User data to update
   */
  static async updateUser(
    id: string,
    data: Partial<ApiUser>
  ): Promise<GetUserResponse> {
    const url = `${API_BASE_URL}/users/${id}`;
    return this.fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete user (Admin only)
   * @param id - User UUID
   */
  static async deleteUser(id: string): Promise<{ success: boolean }> {
    const url = `${API_BASE_URL}/users/${id}`;
    return this.fetchWithAuth(url, {
      method: "DELETE",
    });
  }

  /**
   * Delete multiple users (Admin only)
   * @param ids - Array of user UUIDs
   */
  static async deleteUsers(
    ids: string[]
  ): Promise<{ success: boolean; deleted: number }> {
    // If your API supports batch delete, implement here
    // Otherwise, delete one by one
    const results = await Promise.allSettled(
      ids.map((id) => this.deleteUser(id))
    );

    const deleted = results.filter((r) => r.status === "fulfilled").length;

    return {
      success: deleted === ids.length,
      deleted,
    };
  }
}
