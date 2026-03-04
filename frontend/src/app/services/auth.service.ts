import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest { username: string; password: string; role: string; }
export interface AuthResponse { token: string; role: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = 'http://localhost:8080/api/auth';
  private http = inject(HttpClient);
  private router = inject(Router);

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, req).pipe(tap(r => this.store(r)));
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, req).pipe(tap(r => this.store(r)));
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }
  getRole(): string | null { return typeof window !== 'undefined' ? localStorage.getItem('role') : null; }
  isLoggedIn(): boolean { return !!this.getToken(); }

  private store(res: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role);
    }
  }
}
