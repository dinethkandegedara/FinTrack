import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Shell Component providing the main layout wrapper (navigation sidebar + header + content router-outlet)
 * for all authenticated pages.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell-layout">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">FinTrack</span>
            <span class="brand-tag">PRO</span>
          </div>
        </div>

        <nav class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="9" rx="1"/>
              <rect x="14" y="3" width="7" height="5" rx="1"/>
              <rect x="14" y="12" width="7" height="9" rx="1"/>
              <rect x="3" y="16" width="7" height="5" rx="1"/>
            </svg>
            <span>Dashboard</span>
          </a>

          <a routerLink="/transactions" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>Transactions</span>
          </a>

          <a routerLink="/categories" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span>Categories</span>
          </a>

          <a routerLink="/budgets" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
              <path d="M22 12A10 10 0 0 0 12 2v10z"/>
            </svg>
            <span>Budgets</span>
          </a>

          <a routerLink="/profile" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Profile</span>
          </a>
        </nav>

        <!-- User profile summary & logout footer -->
        <div class="user-panel">
          <div class="user-info">
            <div class="user-avatar">{{ userInitials() }}</div>
            <div class="user-details">
              <span class="user-name">{{ authService.currentUser()?.fullName }}</span>
              <span class="user-email">{{ authService.currentUser()?.email }}</span>
            </div>
          </div>
          <button type="button" class="btn-logout" (click)="onLogout()" title="Log out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell-layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-main);
    }
    .sidebar {
      width: 260px;
      background: #0d1322;
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 40;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem 1.75rem;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 1.25rem;
    }
    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: var(--gradient-primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .brand-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .brand-name {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
    }
    .brand-tag {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.4);
    }
    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      flex: 1;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.92rem;
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
    }
    .nav-item.active {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .nav-icon {
      transition: transform var(--transition-fast);
    }
    .nav-item:hover .nav-icon {
      transform: scale(1.1);
    }
    .user-panel {
      padding: 0.9rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      overflow: hidden;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5, #06b6d4);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .user-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .user-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .btn-logout {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.4rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .btn-logout:hover {
      background: rgba(244, 63, 94, 0.15);
      color: var(--expense);
    }
    .main-content {
      flex: 1;
      padding: 2.5rem;
      max-width: 1300px;
      margin: 0 auto;
      width: 100%;
      overflow-y: auto;
    }
    @media (max-width: 860px) {
      .shell-layout {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        height: auto;
        position: relative;
      }
      .main-content {
        padding: 1.5rem 1rem;
      }
    }
  `]
})
export class ShellComponent {
  readonly authService = inject(AuthService);

  userInitials(): string {
    const name = this.authService.currentUser()?.fullName;
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
