import type { Week, WeekUpdate, LoginResponse } from '../types';

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

  async login(password: string): Promise<boolean> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      const data: LoginResponse = await response.json();
      this.setToken(data.access_token);
      return true;
    }
    return false;
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
}

export const apiClient = new ApiClient();
