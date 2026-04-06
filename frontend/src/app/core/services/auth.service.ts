import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'alumno' | 'admin';
  bio: string;
  dni: string;
  phone: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: UserProfile;
}

const API = 'http://localhost:8000/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<UserProfile | null>(this.loadUser());

  readonly user = this._user.asReadonly();

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${API}/login/`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('access', res.access);
        localStorage.setItem('refresh', res.refresh);
        localStorage.setItem('user', JSON.stringify(res.user));
        this._user.set(res.user);
      })
    );
  }

  logout() {
    const refresh = localStorage.getItem('refresh');
    this.clearSession();
    if (refresh) {
      this.http.post(`${API}/logout/`, { refresh }).subscribe({ error: () => {} });
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private clearSession(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    this._user.set(null);
  }

  private loadUser(): UserProfile | null {
    const raw = localStorage.getItem('user');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
}
