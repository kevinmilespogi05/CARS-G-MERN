const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string; service: string }>('/health');
  }

  // Auth endpoints
  async getProfile() {
    return this.request<any>('/api/auth/profile');
  }

  async updateProfile(data: { displayName?: string; photoURL?: string }) {
    return this.request<any>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPoints() {
    return this.request<{ points: number; displayName: string; role: string }>('/api/auth/points');
  }

  // Reports endpoints
  async getReports(params?: { status?: string; limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return this.request<{ reports: any[]; total: number }>(`/api/reports${query ? `?${query}` : ''}`);
  }

  async getMyReports() {
    return this.request<{ reports: any[] }>('/api/reports/my-reports');
  }

  async getAssignedReports() {
    return this.request<{ reports: any[] }>('/api/reports/assigned');
  }

  async getReport(id: string) {
    return this.request<any>(`/api/reports/${id}`);
  }

  async createReport(data: {
    title: string;
    description: string;
    category: string;
    isAnonymous: boolean;
    location: { lat: number; lng: number };
    imageUrls: string[];
  }) {
    return this.request<any>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReportStatus(id: string, status: string) {
    return this.request<{ message: string }>(`/api/reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async assignReport(id: string, patrolUserId: string) {
    return this.request<{ message: string }>(`/api/reports/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ patrolUserId }),
    });
  }

  async updateReportPriority(id: string, priorityLevel: number) {
    return this.request<{ message: string }>(`/api/reports/${id}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priorityLevel }),
    });
  }

  // Users endpoints
  async getUsers(params?: { role?: string; limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return this.request<{ users: any[]; total: number }>(`/api/users${query ? `?${query}` : ''}`);
  }

  async getLeaderboard(limit: number = 10) {
    return this.request<{ leaderboard: any[] }>(`/api/users/leaderboard?limit=${limit}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/api/users/${id}`);
  }

  async updateUserRole(id: string, role: string) {
    return this.request<{ message: string }>(`/api/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async banUser(id: string, isBanned: boolean) {
    return this.request<{ message: string }>(`/api/users/${id}/ban`, {
      method: 'PUT',
      body: JSON.stringify({ isBanned }),
    });
  }

  async updateUserPoints(id: string, points: number, reason?: string) {
    return this.request<{ message: string }>(`/api/users/${id}/points`, {
      method: 'PUT',
      body: JSON.stringify({ points, reason }),
    });
  }

  async getUserStats(id: string) {
    return this.request<{ stats: any }>(`/api/users/${id}/stats`);
  }

  // Chat endpoints
  async getMessages(params?: { limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return this.request<{ messages: any[] }>(`/api/chat${query ? `?${query}` : ''}`);
  }

  async sendMessage(text: string) {
    return this.request<any>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async getConversation(userId: string, limit: number = 100) {
    return this.request<{ messages: any[] }>(`/api/chat/conversation/${userId}?limit=${limit}`);
  }

  async getConversations() {
    return this.request<{ conversations: any[] }>('/api/chat/conversations');
  }

  async deleteMessage(messageId: string) {
    return this.request<{ message: string }>(`/api/chat/${messageId}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export the class for testing
export { ApiClient };
