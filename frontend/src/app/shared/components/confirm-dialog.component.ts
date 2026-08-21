import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable modal dialog for action confirmation (e.g., delete confirmation).
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onCancel()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-icon warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="modal-content">
            <h3 class="modal-title">{{ title }}</h3>
            <p class="modal-message">{{ message }}</p>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">{{ cancelText }}</button>
            <button type="button" class="btn btn-danger" (click)="onConfirm()">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }
    .modal-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.75rem;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      animation: scaleUp 0.2s ease-out;
    }
    .modal-icon.warning {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(244, 63, 94, 0.15);
      color: #f43f5e;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 0.5rem 0;
    }
    .modal-message {
      font-size: 0.9rem;
      color: #94a3b8;
      line-height: 1.5;
      margin: 0;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .btn {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }
    .btn-danger {
      background: #e11d48;
      color: #ffffff;
    }
    .btn-danger:hover {
      background: #be123c;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleUp { from { transform: scale(0.95); } to { transform: scale(1); } }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed? This action cannot be undone.';
  @Input() confirmText = 'Delete';
  @Input() cancelText = 'Cancel';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
