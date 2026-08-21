import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from './profile.service';
import { User } from '../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

/**
 * Profile Component displaying user account details and supporting profile updates.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="profile-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Account Profile</h1>
          <p class="page-subtitle">View and update your personal account information</p>
        </div>
      </header>

      @if (isLoading()) {
        <app-loading-spinner message="Loading profile..."></app-loading-spinner>
      } @else {
        <div class="profile-layout">
          <!-- Profile Card -->
          <div class="profile-card glass-card">
            <div class="avatar-section">
              <div class="large-avatar">{{ userInitials() }}</div>
              <div class="avatar-text">
                <h3 class="user-display-name">{{ user()?.fullName }}</h3>
                <span class="user-display-email">{{ user()?.email }}</span>
                <span class="badge badge-income" style="margin-top: 0.4rem;">Active Member</span>
              </div>
            </div>

            <div class="account-meta-list">
              <div class="meta-row">
                <span class="meta-label">User ID</span>
                <span class="meta-value">#{{ user()?.id }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Email Address</span>
                <span class="meta-value">{{ user()?.email }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Member Since</span>
                <span class="meta-value">{{ user()?.createdAt | date:'longDate' }}</span>
              </div>
            </div>
          </div>

          <!-- Edit Profile Form -->
          <div class="edit-card glass-card">
            <h3 class="card-title">Edit Profile Information</h3>
            <p class="card-subtitle">Update your personal full name</p>

            @if (successMessage()) {
              <div class="alert alert-success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>{{ successMessage() }}</span>
              </div>
            }

            @if (errorMessage()) {
              <div class="alert alert-error">
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
              <div class="form-group">
                <label class="form-label" for="profileName">Full Name</label>
                <input
                  id="profileName"
                  type="text"
                  class="form-input"
                  formControlName="fullName"
                />
                @if (profileForm.get('fullName')?.invalid && profileForm.get('fullName')?.touched) {
                  <span class="form-error">Full name must be between 2 and 100 characters</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label" for="profileEmail">Email Address (Immutable)</label>
                <input
                  id="profileEmail"
                  type="email"
                  class="form-input disabled-input"
                  [value]="user()?.email"
                  disabled
                />
                <span class="form-note">Email address is fixed as your primary identity identifier.</span>
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="profileForm.invalid || isSaving()"
                >
                  @if (isSaving()) {
                    Saving...
                  } @else {
                    Save Changes
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .page-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #ffffff;
    }
    .page-subtitle {
      font-size: 0.92rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }
    .profile-layout {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 1.5rem;
    }
    .profile-card, .edit-card {
      padding: 2rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .avatar-section {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .large-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--gradient-primary);
      color: #ffffff;
      font-weight: 800;
      font-size: 1.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    .user-display-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
    }
    .user-display-email {
      font-size: 0.88rem;
      color: var(--text-secondary);
    }
    .account-meta-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }
    .meta-label {
      color: var(--text-muted);
    }
    .meta-value {
      color: var(--text-main);
      font-weight: 600;
    }
    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
    }
    .card-subtitle {
      font-size: 0.88rem;
      color: var(--text-secondary);
      margin-top: -1rem;
      margin-bottom: 0.5rem;
    }
    .disabled-input {
      opacity: 0.6;
      cursor: not-allowed;
      background: rgba(15, 23, 42, 0.4);
    }
    .form-note {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .form-actions {
      margin-top: 1rem;
    }
    .alert {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .alert-error {
      background: rgba(244, 63, 94, 0.15);
      color: #fda4af;
      border: 1px solid rgba(244, 63, 94, 0.3);
    }
    @media (max-width: 860px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);

  readonly user = signal<User | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly successMessage = signal<string>('');
  readonly errorMessage = signal<string>('');

  profileForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (userData) => {
        this.user.set(userData);
        this.profileForm.patchValue({ fullName: userData.fullName });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  userInitials(): string {
    const name = this.user()?.fullName;
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { fullName } = this.profileForm.value;

    this.profileService.updateProfile({ fullName: fullName! }).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.authService.currentUser.set(updatedUser);
        this.isSaving.set(false);
        this.successMessage.set('Profile updated successfully!');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update profile');
      }
    });
  }
}
