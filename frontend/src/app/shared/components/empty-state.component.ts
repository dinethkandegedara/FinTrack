import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable visual empty state display.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-card">
      <div class="icon-bubble">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12h8"/>
        </svg>
      </div>
      <h4 class="title">{{ title }}</h4>
      <p class="description">{{ message }}</p>
      @if (actionText) {
        <button type="button" class="btn-action" (click)="action.emit()">
          <span>+</span> {{ actionText }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3.5rem 1.5rem;
      text-align: center;
      background: rgba(30, 41, 59, 0.4);
      border: 1px dashed rgba(255, 255, 255, 0.12);
      border-radius: 16px;
    }
    .icon-bubble {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.1);
      color: #818cf8;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    .title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0 0 0.4rem 0;
    }
    .description {
      font-size: 0.88rem;
      color: #94a3b8;
      max-width: 340px;
      line-height: 1.5;
      margin: 0 0 1.5rem 0;
    }
    .btn-action {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      transition: all 0.2s ease;
    }
    .btn-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'No items found';
  @Input() message = 'Get started by creating your first entry.';
  @Input() actionText?: string;

  @Output() action = new EventEmitter<void>();
}
