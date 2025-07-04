import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.removeToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  // Auth methods
  async login(username: string, password: string) {
    const response = await this.api.post('/auth/login/', { username, password });
    const { token, user } = response.data;
    this.setToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    return response.data;
  }

  async logout() {
    try {
      await this.api.post('/auth/logout/');
    } finally {
      this.removeToken();
    }
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile/');
    return response.data;
  }

  // User methods
  async getUsers(params?: any) {
    const response = await this.api.get('/users/', { params });
    return response.data;
  }

  async getUser(userId: string) {
    const response = await this.api.get(`/users/${userId}/`);
    return response.data;
  }

  async getUserTransactions(userId: string, params?: any) {
    const response = await this.api.get(`/users/${userId}/transactions/`, { params });
    return response.data;
  }

  // Transaction methods
  async getTransactions(params?: any) {
    const response = await this.api.get('/transactions/', { params });
    return response.data;
  }

  async getTransaction(transactionId: string) {
    const response = await this.api.get(`/transactions/${transactionId}/`);
    return response.data;
  }

  // Refund methods
  async getRefunds(params?: any) {
    const response = await this.api.get('/refunds/', { params });
    return response.data;
  }

  async createRefund(data: any) {
    const response = await this.api.post('/refunds/', data);
    return response.data;
  }

  async processRefund(refundId: string, action: 'approve' | 'reject') {
    const response = await this.api.post(`/refunds/${refundId}/process/`, { action });
    return response.data;
  }

  // Chat methods
  async getChatMessages(params?: any) {
    const response = await this.api.get('/chat/', { params });
    return response.data;
  }

  async sendChatMessage(data: any) {
    const response = await this.api.post('/chat/', data);
    return response.data;
  }

  // Notification methods
  async sendNotification(data: any) {
    const response = await this.api.post('/notifications/send/', data);
    return response.data;
  }

  // Activity methods
  async getUserActivities(params?: any) {
    const response = await this.api.get('/activities/', { params });
    return response.data;
  }

  // Dashboard methods
  async getDashboardStats() {
    const response = await this.api.get('/dashboard/stats/');
    return response.data;
  }

  async getChartData(params?: any) {
    const response = await this.api.get('/dashboard/charts/', { params });
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.api.get('/health/');
    return response.data;
  }
}

export const apiClient = new ApiClient();