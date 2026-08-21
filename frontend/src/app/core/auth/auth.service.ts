import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { UpdateProfileRequest, User } from '../models/user.model';

const TOKEN_KEY = 'fintrack_token';
const USER_KEY = 'fintrack_user';

/**
 * Core Authentication Service managing authentication state via modern Angular Signals.
 *
 * <p>Architectural decisions:
 * <ul>
 *   <li><b>Angular Signals:</b> {@code currentUser} and {@code token} signals enable fine-grained,
 *       glitch-free reactive UI updates across components without manual subscription management.</li>
 *   <li><b>Persistence:</b> Stores JWT in {@code localStorage} for session continuity across page reloads.</li>
 * </ul>
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly usersUrl = `${environment.apiUrl}/users`;

  // Reactive state signals
  readonly token = signal<string | null>(this.getStoredToken());
  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.token() && !!this.currentUser());

  /**
   * Registers a new user account.
   */
  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.authUrl}/register`, request);
  }

  /**
   * Logs in with email & password, persists JWT and user in state.
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, request).pipe(
      tap((response) => {
        this.setSession(response);
      })
    );
  }

  /**
   * Refreshes the currently authenticated user's profile from the backend.
   */
  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  /**
   * Updates the profile of the current user.
   */
  updateProfile(request: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.usersUrl}/me`, request).pipe(
      tap((user) => {
        this.currentUser.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  /**
   * Clears authentication session and redirects to the login screen.
   */
  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  private setSession(authResponse: AuthResponse): void {
    this.token.set(authResponse.token);
    this.currentUser.set(authResponse.user);
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
