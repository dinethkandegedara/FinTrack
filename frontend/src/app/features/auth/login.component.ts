import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Login Component implementing user authentication via Reactive Forms.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <div class="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h2 class="auth-title">Welcome back</h2>
          <p class="auth-subtitle">Sign in to your FinTrack account</p>
        </div>

        @if (errorMessage) {
          <div class="alert alert-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        }

        @if (successMessage) {
          <div class="alert alert-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>{{ successMessage }}</span>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input
              id="email"
              type="email"
              class="form-input"
              placeholder="you@example.com"
              formControlName="email"
              [class.invalid]="isFieldInvalid('email')"
            />
            @if (isFieldInvalid('email')) {
              <span class="form-error">Please enter a valid email address</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              id="password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              formControlName="password"
              [class.invalid]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <span class="form-error">Password is required</span>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="loginForm.invalid || isLoading"
          >
            @if (isLoading) {
              <span class="btn-spinner"></span> Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <div class="auth-footer">
          <span>Don't have an account?</span>
          <a routerLink="/register" class="auth-link">Create an account</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: radial-gradient(circle at top, #1e1b4b 0%, #0a0f1d 70%);
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 2.5rem;
      border-radius: 20px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .auth-logo {
      width: 52px;
      height: 52px;
      margin: 0 auto 1.25rem;
      border-radius: 14px;
      background: var(--gradient-primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-glow);
    }
    .auth-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.35rem;
    }
    .auth-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .alert {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
      margin-bottom: 1.25rem;
    }
    .alert-error {
      background: rgba(244, 63, 94, 0.15);
      color: #fda4af;
      border: 1px solid rgba(244, 63, 94, 0.3);
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .form-input.invalid {
      border-color: var(--expense);
    }
    .btn-block {
      width: 100%;
      padding: 0.85rem;
      font-size: 1rem;
      margin-top: 0.5rem;
    }
    .auth-footer {
      text-align: center;
      margin-top: 1.75rem;
      font-size: 0.88rem;
      color: var(--text-secondary);
    }
    .auth-link {
      color: #818cf8;
      font-weight: 600;
      text-decoration: none;
      margin-left: 0.35rem;
    }
    .auth-link:hover {
      text-decoration: underline;
    }
    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    // Read optional success redirect message from registration
    this.route.queryParams.subscribe((params) => {
      if (params['registered']) {
        this.successMessage = 'Registration successful! Please sign in with your credentials.';
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
      }
    });
  }
}
