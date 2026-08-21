import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable animated glassmorphic loading spinner.
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class.overlay]="overlay">
      <div class="spinner-ring"></div>
      @if (message) {
        <p class="spinner-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem;
      gap: 1rem;
    }
    .spinner-container.overlay {
      position: absolute;
      inset: 0;
      background: rgba(11, 15, 25, 0.7);
      backdrop-filter: blur(6px);
      z-index: 50;
      border-radius: inherit;
    }
    .spinner-ring {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(99, 102, 241, 0.2);
      border-top-color: #6366f1;
      border-right-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    .spinner-message {
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 500;
      margin: 0;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
  @Input() overlay = false;
}
