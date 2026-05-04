import type { Week, WeekUpdate, LoginResponse, User, UserSettings } from '../types';

const TOKEN_KEY = 'calendar_token';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async login(email: string, password: string): Promise<boolean> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data: LoginResponse = await response.json();
      this.setToken(data.access_token);
      return true;
    }
    return false;
  }

  async register(name: string, email: string, password: string): Promise<boolean> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      const data: LoginResponse = await response.json();
      this.setToken(data.access_token);
      return true;
    }
    return false;
  }

  async getMe(): Promise<User> {
    const response = await fetch('/api/auth/me', {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      throw new Error('Failed to get user');
    }

    return response.json();
  }

  async agentToken(
    expiresInDays: number
  ): Promise<{ access_token: string; token_type: string; expires_in_days: number }> {
    const response = await fetch('/api/auth/agent-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({
        expires_in_days: expiresInDays,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Failed to generate agent token');
    }

    return response.json();
  }

  logout(): void {
    this.clearToken();
  }

  async getWeeks(startDate: Date, endDate: Date): Promise<Week[]> {
    const params = new URLSearchParams({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });

    const response = await fetch(`/api/weeks?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch weeks');
    }

    return response.json();
  }

  async updateWeek(weekStart: string, data: WeekUpdate): Promise<Week> {
    const response = await fetch(`/api/weeks/${weekStart}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to update week');
    }

    return response.json();
  }

  async getSettings(): Promise<UserSettings> {
    const response = await fetch('/api/settings', {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch settings');
    }

    return response.json();
  }

  async updateSettings(settings: UserSettings): Promise<UserSettings> {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to update settings');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
