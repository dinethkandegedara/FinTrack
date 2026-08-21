import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService } from './budget.service';
import { Budget } from './budget.model';
import { CategoryService } from '../categories/category.service';
import { Category } from '../categories/category.model';
import { CurrencySignPipe } from '../../shared/pipes/currency-sign.pipe';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

/**
 * Budget List Component providing visual budget-vs-actual spending health meters and management.
 */
@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencySignPipe,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="budget-page">
      <!-- Header with month selector and action button -->
      <header class="page-header">
        <div>
          <h1 class="page-title">Monthly Budgets</h1>
          <p class="page-subtitle">Set category spending limits and monitor your budget health</p>
        </div>

        <div class="header-actions">
          <div class="month-selector glass-card">
            <button type="button" class="btn-arrow" (click)="changeMonth(-1)" title="Previous month">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span class="current-month-label">{{ getMonthName(selectedMonth()) }} {{ selectedYear() }}</span>
            <button type="button" class="btn-arrow" (click)="changeMonth(1)" title="Next month">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <button type="button" class="btn btn-primary" (click)="openCreateModal()">
            <span>+</span> Set Budget
          </button>
        </div>
      </header>

      <!-- Overall Monthly Budget Health Summary -->
      @if (budgets().length > 0) {
        <div class="health-summary glass-card">
          <div class="health-item">
            <span class="health-label">Total Budgeted</span>
            <span class="health-val">{{ totalBudgeted() | currencySign }}</span>
          </div>
          <div class="health-divider"></div>
          <div class="health-item">
            <span class="health-label">Total Spent</span>
            <span class="health-val expense-text">{{ totalSpent() | currencySign }}</span>
          </div>
          <div class="health-divider"></div>
          <div class="health-item">
            <span class="health-label">Overall Utilization</span>
            <span class="health-val" [class.income-text]="overallPercent() <= 80" [class.expense-text]="overallPercent() > 100">
              {{ overallPercent() }}%
            </span>
          </div>
        </div>
      }

      <!-- Action Error Alert -->
      @if (actionError()) {
        <div class="alert alert-error">
          <span>{{ actionError() }}</span>
        </div>
      }

      <!-- Budgets Grid / Empty State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading monthly budgets..."></app-loading-spinner>
      } @else if (budgets().length === 0) {
        <app-empty-state
          title="No budgets for this month"
          message="Plan your spending by setting monthly budgets for categories like Groceries, Entertainment, or Dining."
          actionText="Set First Budget"
          (action)="openCreateModal()"
        ></app-empty-state>
      } @else {
        <div class="budget-grid">
          @for (b of budgets(); track b.id) {
            <div class="budget-card glass-card" [class.card-overbudget]="b.percentUsed > 100">
              <div class="card-header">
                <div class="cat-badge-wrap">
                  <h3 class="b-cat-name">{{ b.category.name }}</h3>
                  @if (b.percentUsed > 100) {
                    <span class="badge badge-expense">Over Budget</span>
                  } @else if (b.percentUsed >= 80) {
                    <span class="badge badge-warning">Near Limit</span>
                  } @else {
                    <span class="badge badge-income">On Track</span>
                  }
                </div>
                <div class="card-menu">
                  <button type="button" class="btn-icon" (click)="openEditModal(b)" title="Edit Amount">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </button>
                  <button type="button" class="btn-icon delete-icon" (click)="confirmDelete(b)" title="Delete Budget">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="spending-comparison">
                <div class="spent-block">
                  <span class="lbl">Spent so far</span>
                  <span class="val">{{ b.spent | currencySign }}</span>
                </div>
                <div class="limit-block">
                  <span class="lbl">Monthly Limit</span>
                  <span class="val">{{ b.amount | currencySign }}</span>
                </div>
              </div>

              <!-- Visual Progress Bar -->
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  [class.fill-green]="b.percentUsed < 80"
                  [class.fill-yellow]="b.percentUsed >= 80 && b.percentUsed <= 100"
                  [class.fill-red]="b.percentUsed > 100"
                  [style.width.%]="getClamped(b.percentUsed)"
                ></div>
              </div>

              <div class="card-footer">
                <span class="utilization-label">{{ b.percentUsed }}% used</span>
                <span class="remaining-label">
                  @if (b.remaining >= 0) {
                    {{ b.remaining | currencySign }} left
                  } @else {
                    {{ -b.remaining | currencySign }} over limit
                  }
                </span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Create / Edit Modal -->
      @if (isModalOpen()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ editingBudget() ? 'Edit Budget Limit' : 'Set Category Budget' }}</h3>
              <button type="button" class="btn-close" (click)="closeModal()">&times;</button>
            </div>

            <form [formGroup]="budgetForm" (ngSubmit)="saveBudget()">
              <div class="form-group">
                <label class="form-label" for="budgetCategory">Expense Category</label>
                <select
                  id="budgetCategory"
                  class="form-select"
                  formControlName="categoryId"
                  [disabled]="!!editingBudget()"
                >
                  <option [ngValue]="null" disabled>Select an expense category...</option>
                  @for (cat of expenseCategories(); track cat.id) {
                    <option [ngValue]="cat.id">{{ cat.name }}</option>
                  }
                </select>
                @if (expenseCategories().length === 0) {
                  <span class="form-note">Please create an EXPENSE category first in the Categories section.</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label" for="budgetAmount">Monthly Target Amount ($)</label>
                <input
                  id="budgetAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="form-input"
                  placeholder="e.g. 400.00"
                  formControlName="amount"
                />
                @if (budgetForm.get('amount')?.invalid && budgetForm.get('amount')?.touched) {
                  <span class="form-error">Amount must be strictly greater than 0</span>
                }
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="budgetForm.invalid || isSubmitting() || (!editingBudget() && expenseCategories().length === 0)"
                >
                  @if (isSubmitting()) {
                    Saving...
                  } @else {
                    {{ editingBudget() ? 'Update Budget' : 'Set Budget' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="isDeleteModalOpen()"
        title="Delete Budget"
        [message]="'Are you sure you want to delete the budget for ' + budgetToDelete()?.category?.name + '?'"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen.set(false)"
      ></app-confirm-dialog>
    </div>
  `,
  styles: [`
    .budget-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
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
    .month-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.4rem 0.8rem;
      border-radius: var(--radius-md);
    }
    .current-month-label {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--text-main);
      min-width: 140px;
      text-align: center;
    }
    .btn-arrow {
      background: rgba(255, 255, 255, 0.06);
      border: none;
      color: var(--text-secondary);
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-arrow:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }
    .health-summary {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 1.25rem 2rem;
      border-radius: var(--radius-lg);
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .health-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
    .health-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .health-val {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .health-divider {
      width: 1px;
      height: 40px;
      background: var(--border-subtle);
    }
    .budget-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .budget-card {
      padding: 1.75rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .card-overbudget {
      border-color: rgba(244, 63, 94, 0.4);
      box-shadow: 0 0 20px -5px rgba(244, 63, 94, 0.25);
    }
    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .cat-badge-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .b-cat-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: #ffffff;
    }
    .card-menu {
      display: flex;
      gap: 0.4rem;
    }
    .btn-icon.delete-icon:hover {
      background: rgba(244, 63, 94, 0.2);
      color: var(--expense);
    }
    .spending-comparison {
      display: flex;
      justify-content: space-between;
      padding: 0.85rem;
      background: rgba(15, 23, 42, 0.5);
      border-radius: var(--radius-md);
    }
    .spent-block, .limit-block {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .limit-block {
      text-align: right;
    }
    .lbl {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .val {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .progress-bar-bg {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.4s ease;
    }
    .fill-green {
      background: var(--income);
    }
    .fill-yellow {
      background: var(--warning);
    }
    .fill-red {
      background: var(--expense);
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .remaining-label {
      color: var(--text-secondary);
    }
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
    }
    .modal-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      padding: 1.75rem;
      max-width: 460px;
      width: 100%;
      box-shadow: var(--shadow-lg);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
    }
    .btn-close {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 1.5rem;
      cursor: pointer;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .form-note {
      font-size: 0.8rem;
      color: var(--warning);
      margin-top: 0.35rem;
    }
    .alert-error {
      background: rgba(244, 63, 94, 0.15);
      color: #fda4af;
      border: 1px solid rgba(244, 63, 94, 0.3);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
    }
  `]
})
export class BudgetListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly budgetService = inject(BudgetService);
  private readonly categoryService = inject(CategoryService);

  readonly currentDate = new Date();
  readonly selectedYear = signal<number>(this.currentDate.getFullYear());
  readonly selectedMonth = signal<number>(this.currentDate.getMonth() + 1);

  readonly budgets = signal<Budget[]>([]);
  readonly expenseCategories = signal<Category[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Modals state
  readonly isModalOpen = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly editingBudget = signal<Budget | null>(null);
  readonly actionError = signal<string>('');

  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly budgetToDelete = signal<Budget | null>(null);

  budgetForm = this.fb.group({
    categoryId: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]]
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadBudgets();
  }

  loadCategories(): void {
    this.categoryService.getCategories('EXPENSE').subscribe({
      next: (cats) => this.expenseCategories.set(cats)
    });
  }

  loadBudgets(): void {
    this.isLoading.set(true);
    this.budgetService.getBudgets(this.selectedYear(), this.selectedMonth()).subscribe({
      next: (data) => {
        this.budgets.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  changeMonth(delta: number): void {
    let newMonth = this.selectedMonth() + delta;
    let newYear = this.selectedYear();

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    this.selectedMonth.set(newMonth);
    this.selectedYear.set(newYear);
    this.loadBudgets();
  }

  getMonthName(monthNum: number): string {
    const date = new Date(2026, monthNum - 1, 1);
    return date.toLocaleString('default', { month: 'long' });
  }

  totalBudgeted(): number {
    return this.budgets().reduce((sum, b) => sum + Number(b.amount), 0);
  }

  totalSpent(): number {
    return this.budgets().reduce((sum, b) => sum + Number(b.spent), 0);
  }

  overallPercent(): number {
    const totalB = this.totalBudgeted();
    if (totalB <= 0) return 0;
    return Math.round((this.totalSpent() / totalB) * 100);
  }

  getClamped(val: number): number {
    return Math.min(100, Math.max(0, val));
  }

  openCreateModal(): void {
    this.editingBudget.set(null);
    this.actionError.set('');
    this.budgetForm.reset({
      categoryId: this.expenseCategories().length > 0 ? this.expenseCategories()[0].id : null,
      amount: null
    });
    this.budgetForm.get('categoryId')?.enable();
    this.isModalOpen.set(true);
  }

  openEditModal(budget: Budget): void {
    this.editingBudget.set(budget);
    this.actionError.set('');
    this.budgetForm.patchValue({
      categoryId: budget.category.id,
      amount: budget.amount
    });
    this.budgetForm.get('categoryId')?.disable();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingBudget.set(null);
  }

  saveBudget(): void {
    if (this.budgetForm.invalid) return;

    this.isSubmitting.set(true);
    this.actionError.set('');
    const formVal = this.budgetForm.getRawValue();

    const req = {
      categoryId: formVal.categoryId!,
      budgetYear: this.selectedYear(),
      budgetMonth: this.selectedMonth(),
      amount: Number(formVal.amount!)
    };

    const editing = this.editingBudget();
    if (editing) {
      this.budgetService.updateBudget(editing.id, req).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.loadBudgets();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.actionError.set(err.error?.message || 'Failed to update budget');
        }
      });
    } else {
      this.budgetService.createBudget(req).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.loadBudgets();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.actionError.set(err.error?.message || 'Failed to create budget');
        }
      });
    }
  }

  confirmDelete(budget: Budget): void {
    this.actionError.set('');
    this.budgetToDelete.set(budget);
    this.isDeleteModalOpen.set(true);
  }

  executeDelete(): void {
    const budget = this.budgetToDelete();
    if (!budget) return;

    this.isDeleteModalOpen.set(false);
    this.budgetService.deleteBudget(budget.id).subscribe({
      next: () => {
        this.budgetToDelete.set(null);
        this.loadBudgets();
      },
      error: (err) => {
        this.actionError.set(err.error?.message || 'Failed to delete budget');
        this.budgetToDelete.set(null);
      }
    });
  }
}
