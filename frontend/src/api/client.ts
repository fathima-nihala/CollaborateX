import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add token
    this.instance.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.instance.post('/auth/refresh-token', {
              refreshToken,
            });

            const { data } = response.data;
            localStorage.setItem('accessToken', data.tokens.accessToken);
            localStorage.setItem('refreshToken', data.tokens.refreshToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  register(email: string, username: string, password: string, firstName?: string, lastName?: string) {
    return this.instance.post('/auth/register', {
      email,
      username,
      password,
      firstName,
      lastName,
    });
  }

  login(email: string, password: string) {
    return this.instance.post('/auth/login', { email, password });
  }

  logout(refreshToken: string) {
    return this.instance.post('/auth/logout', { refreshToken });
  }

  // Project endpoints
  getProjects(page = 1, limit = 10) {
    return this.instance.get('/projects', {
      params: { page, limit },
    });
  }

  getProject(id: string) {
    return this.instance.get(`/projects/${id}`);
  }

  createProject(name: string, description?: string) {
    return this.instance.post('/projects', { name, description });
  }

  updateProject(id: string, name?: string, description?: string, status?: string) {
    return this.instance.put(`/projects/${id}`, { name, description, status });
  }

  deleteProject(id: string) {
    return this.instance.delete(`/projects/${id}`);
  }

  addProjectMember(projectId: string, userId: string, role?: string) {
    return this.instance.post(`/projects/${projectId}/members`, { userId, role });
  }

  removeProjectMember(projectId: string, memberId: string) {
    return this.instance.delete(`/projects/${projectId}/members/${memberId}`);
  }

  // Task endpoints
  getTasks(
    projectId: string,
    page = 1,
    limit = 10,
    filters?: { status?: string; priority?: string; assignedToId?: string }
  ) {
    return this.instance.get(`/projects/${projectId}/tasks`, {
      params: { page, limit, ...filters },
    });
  }

  getTask(projectId: string, taskId: string) {
    return this.instance.get(`/projects/${projectId}/tasks/${taskId}`);
  }

  createTask(
    projectId: string,
    title: string,
    description?: string,
    priority?: string,
    assignedToId?: string,
    dueDate?: string
  ) {
    return this.instance.post(`/projects/${projectId}/tasks`, {
      title,
      description,
      priority,
      assignedToId,
      dueDate,
    });
  }

  updateTask(projectId: string, taskId: string, data: any) {
    return this.instance.put(`/projects/${projectId}/tasks/${taskId}`, data);
  }

  deleteTask(projectId: string, taskId: string) {
    return this.instance.delete(`/projects/${projectId}/tasks/${taskId}`);
  }

  // User endpoints
  searchUsers(query: string) {
    return this.instance.get('/users/search', {
      params: { query },
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
