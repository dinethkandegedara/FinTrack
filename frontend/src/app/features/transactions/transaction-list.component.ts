import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from './transaction.service';
import { PaginatedResponse, Transaction, TransactionFilter } from './transaction.model';
import { CategoryService } from '../categories/category.service';
import { Category, CategoryType } from '../categories/category.model';
import { CurrencySignPipe } from '../../shared/pipes/currency-sign.pipe';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

/**
 * Transaction List Component supporting full filtering, pagination, and modal CRUD operations.
 */
@Component({
  selector: 'app-transaction-list',
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
    <div class="transaction-page">
      <!-- Header -->
      <header class="page-header">
        <div>
          <h1 class="page-title">Transactions</h1>
          <p class="page-subtitle">Track, filter, and manage all your income and expense records</p>
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreateModal()">
          <span>+</span> Record Transaction
        </button>
      </header>

      <!-- Dynamic Filter Bar -->
      <div class="filter-card glass-card">
        <div class="filter-row">
          <!-- Keyword Search -->
          <div class="filter-item search-item">
            <label class="filter-label" for="keywordSearch">Search Description</label>
            <div class="search-input-wrapper">
              <input
                id="keywordSearch"
                type="text"
                class="form-input"
                placeholder="Search transactions..."
                [(ngModel)]="filterKeyword"
                (ngModelChange)="onFilterChange()"
              />
            </div>
          </div>

          <!-- Type Filter -->
          <div class="filter-item">
            <label class="filter-label" for="typeFilter">Type</label>
            <select
              id="typeFilter"
              class="form-select"
              [(ngModel)]="filterType"
              (ngModelChange)="onFilterChange()"
            >
              <option value="">All Types</option>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div class="filter-item">
            <label class="filter-label" for="categoryFilter">Category</label>
            <select
              id="categoryFilter"
              class="form-select"
              [(ngModel)]="filterCategoryId"
              (ngModelChange)="onFilterChange()"
            >
              <option [ngValue]="null">All Categories</option>
              @for (cat of categories(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.name }} ({{ cat.type }})</option>
              }
            </select>
          </div>

          <!-- Start Date -->
          <div class="filter-item">
            <label class="filter-label" for="startDateFilter">From Date</label>
            <input
              id="startDateFilter"
              type="date"
              class="form-input"
              [(ngModel)]="filterStartDate"
              (ngModelChange)="onFilterChange()"
            />
          </div>

          <!-- End Date -->
          <div class="filter-item">
            <label class="filter-label" for="endDateFilter">To Date</label>
            <input
              id="endDateFilter"
              type="date"
              class="form-input"
              [(ngModel)]="filterEndDate"
              (ngModelChange)="onFilterChange()"
            />
          </div>

          <!-- Reset Button -->
          <div class="filter-item reset-item">
            <button type="button" class="btn btn-secondary" (click)="resetFilters()" title="Reset Filters">
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Action Error Alert -->
      @if (actionError()) {
        <div class="alert alert-error">
          <span>{{ actionError() }}</span>
        </div>
      }

      <!-- Transactions Table / Empty State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading transactions..."></app-loading-spinner>
      } @else if (!pageData() || pageData()!.content.length === 0) {
        <app-empty-state
          title="No transactions found"
          message="No transactions match your current search filters or date range."
          actionText="Add Transaction"
          (action)="openCreateModal()"
        ></app-empty-state>
      } @else {
        <div class="table-container glass-card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style="text-align: right;">Amount</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of pageData()!.content; track item.id) {
                  <tr>
                    <td>
                      <span class="tx-date">{{ item.transactionDate | date:'mediumDate' }}</span>
                    </td>
                    <td>
                      <span class="tx-desc">{{ item.description || '—' }}</span>
                    </td>
                    <td>
                      <span class="tx-category">{{ item.category.name }}</span>
                    </td>
                    <td>
                      <span class="badge" [class.badge-income]="item.type === 'INCOME'" [class.badge-expense]="item.type === 'EXPENSE'">
                        {{ item.type }}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <span
                        class="tx-amount"
                        [class.income-amount]="item.type === 'INCOME'"
                        [class.expense-amount]="item.type === 'EXPENSE'"
                      >
                        {{ item.amount | currencySign:true }}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div class="action-btns">
                        <button type="button" class="btn btn-secondary btn-sm" (click)="openEditModal(item)">
                          Edit
                        </button>
                        <button type="button" class="btn btn-danger btn-sm" (click)="confirmDelete(item)">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div class="pagination-bar">
            <span class="page-meta">
              Showing {{ (currentPage() * pageSize()) + 1 }} -
              {{ Math.min((currentPage() + 1) * pageSize(), pageData()!.totalElements) }}
              of {{ pageData()!.totalElements }} transactions
            </span>

            <div class="pagination-controls">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                [disabled]="pageData()!.first"
                (click)="goToPage(currentPage() - 1)"
              >
                &larr; Previous
              </button>
              <span class="page-number">Page {{ currentPage() + 1 }} of {{ pageData()!.totalPages || 1 }}</span>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                [disabled]="pageData()!.last"
                (click)="goToPage(currentPage() + 1)"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Create / Edit Modal -->
      @if (isModalOpen()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ editingTransaction() ? 'Edit Transaction' : 'Record Transaction' }}</h3>
              <button type="button" class="btn-close" (click)="closeModal()">&times;</button>
            </div>

            <form [formGroup]="transactionForm" (ngSubmit)="saveTransaction()">
              <div class="form-group">
                <label class="form-label" for="txCategory">Category</label>
                <select id="txCategory" class="form-select" formControlName="categoryId">
                  <option [ngValue]="null" disabled>Select a category...</option>
                  @for (cat of categories(); track cat.id) {
                    <option [ngValue]="cat.id">{{ cat.name }} ({{ cat.type }})</option>
                  }
                </select>
                @if (transactionForm.get('categoryId')?.invalid && transactionForm.get('categoryId')?.touched) {
                  <span class="form-error">Please select a category</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label" for="txAmount">Amount ($)</label>
                <input
                  id="txAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="form-input"
                  placeholder="0.00"
                  formControlName="amount"
                />
                @if (transactionForm.get('amount')?.invalid && transactionForm.get('amount')?.touched) {
                  <span class="form-error">Amount must be strictly greater than 0</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label" for="txDate">Transaction Date</label>
                <input
                  id="txDate"
                  type="date"
                  class="form-input"
                  formControlName="transactionDate"
                />
                @if (transactionForm.get('transactionDate')?.invalid && transactionForm.get('transactionDate')?.touched) {
                  <span class="form-error">Date is required</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label" for="txDesc">Description (Optional)</label>
                <input
                  id="txDesc"
                  type="text"
                  class="form-input"
                  placeholder="e.g. Weekly grocery shopping at Trader Joe's"
                  formControlName="description"
                />
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="transactionForm.invalid || isSubmitting()"
                >
                  @if (isSubmitting()) {
                    Saving...
                  } @else {
                    {{ editingTransaction() ? 'Update' : 'Save Transaction' }}
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
        title="Delete Transaction"
        [message]="'Are you sure you want to delete this transaction for ' + (transactionToDelete()?.amount | currencySign) + '?'"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen.set(false)"
      ></app-confirm-dialog>
    </div>
  `,
  styles: [`
    .transaction-page {
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
    .filter-card {
      padding: 1.25rem;
      border-radius: var(--radius-lg);
    }
    .filter-row {
      display: flex;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex: 1;
      min-width: 140px;
    }
    .search-item {
      flex: 2;
      min-width: 200px;
    }
    .reset-item {
      flex: 0;
      min-width: auto;
    }
    .filter-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .table-container {
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .tx-date {
      color: var(--text-secondary);
      font-size: 0.88rem;
      white-space: nowrap;
    }
    .tx-desc {
      font-weight: 600;
      color: var(--text-main);
    }
    .tx-category {
      color: #cbd5e1;
      font-weight: 500;
    }
    .tx-amount {
      font-weight: 700;
      font-size: 1rem;
    }
    .income-amount {
      color: var(--income);
    }
    .expense-amount {
      color: var(--expense);
    }
    .action-btns {
      display: inline-flex;
      gap: 0.4rem;
    }
    .btn-sm {
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
    }
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-subtle);
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-meta {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .page-number {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-main);
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
      max-width: 480px;
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
    .alert-error {
      background: rgba(244, 63, 94, 0.15);
      color: #fda4af;
      border: 1px solid rgba(244, 63, 94, 0.3);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
    }
  `]
})
export class TransactionListComponent implements OnInit {
  protected readonly Math = Math;

  private readonly fb = inject(FormBuilder);
  private readonly transactionService = inject(TransactionService);
  private readonly categoryService = inject(CategoryService);

  readonly pageData = signal<PaginatedResponse<Transaction> | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Filters
  filterKeyword = '';
  filterType: '' | CategoryType = '';
  filterCategoryId: number | null = null;
  filterStartDate = '';
  filterEndDate = '';

  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);

  // Modals state
  readonly isModalOpen = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly editingTransaction = signal<Transaction | null>(null);
  readonly actionError = signal<string>('');

  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly transactionToDelete = signal<Transaction | null>(null);

  transactionForm = this.fb.group({
    categoryId: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    transactionDate: [new Date().toISOString().substring(0, 10), Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadTransactions();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats)
    });
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    const filter: TransactionFilter = {
      keyword: this.filterKeyword || undefined,
      type: this.filterType ? this.filterType : undefined,
      categoryId: this.filterCategoryId !== null ? this.filterCategoryId : undefined,
      startDate: this.filterStartDate || undefined,
      endDate: this.filterEndDate || undefined,
      page: this.currentPage(),
      size: this.pageSize(),
      sort: 'transactionDate,desc'
    };

    this.transactionService.getTransactions(filter).subscribe({
      next: (data) => {
        this.pageData.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadTransactions();
  }

  resetFilters(): void {
    this.filterKeyword = '';
    this.filterType = '';
    this.filterCategoryId = null;
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.currentPage.set(0);
    this.loadTransactions();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadTransactions();
  }

  openCreateModal(): void {
    this.editingTransaction.set(null);
    this.actionError.set('');
    this.transactionForm.reset({
      categoryId: null,
      amount: null,
      transactionDate: new Date().toISOString().substring(0, 10),
      description: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(tx: Transaction): void {
    this.editingTransaction.set(tx);
    this.actionError.set('');
    this.transactionForm.patchValue({
      categoryId: tx.category.id,
      amount: tx.amount,
      transactionDate: tx.transactionDate,
      description: tx.description || ''
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingTransaction.set(null);
  }

  saveTransaction(): void {
    if (this.transactionForm.invalid) return;

    this.isSubmitting.set(true);
    this.actionError.set('');
    const formVal = this.transactionForm.value;

    const req = {
      categoryId: formVal.categoryId!,
      amount: Number(formVal.amount!),
      transactionDate: formVal.transactionDate!,
      description: formVal.description || ''
    };

    const editing = this.editingTransaction();
    if (editing) {
      this.transactionService.updateTransaction(editing.id, req).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.loadTransactions();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.actionError.set(err.error?.message || 'Failed to update transaction');
        }
      });
    } else {
      this.transactionService.createTransaction(req).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.loadTransactions();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.actionError.set(err.error?.message || 'Failed to record transaction');
        }
      });
    }
  }

  confirmDelete(tx: Transaction): void {
    this.actionError.set('');
    this.transactionToDelete.set(tx);
    this.isDeleteModalOpen.set(true);
  }

  executeDelete(): void {
    const tx = this.transactionToDelete();
    if (!tx) return;

    this.isDeleteModalOpen.set(false);
    this.transactionService.deleteTransaction(tx.id).subscribe({
      next: () => {
        this.transactionToDelete.set(null);
        this.loadTransactions();
      },
      error: (err) => {
        this.actionError.set(err.error?.message || 'Failed to delete transaction');
        this.transactionToDelete.set(null);
      }
    });
  }
}
