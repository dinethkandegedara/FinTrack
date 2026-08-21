import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from './category.service';
import { Category, CategoryType } from './category.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

/**
 * Category List Component managing category display, creation, editing, and deletion.
 */
@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="category-page">
      <!-- Header -->
      <header class="page-header">
        <div>
          <h1 class="page-title">Categories</h1>
          <p class="page-subtitle">Organize your income streams and expense categories</p>
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreateModal()">
          <span>+</span> Add Category
        </button>
      </header>

      <!-- Category Type Filter Tabs -->
      <div class="tabs-bar glass-card">
        <button
          type="button"
          class="tab-btn"
          [class.active]="selectedTab() === 'ALL'"
          (click)="setTab('ALL')"
        >
          All ({{ categories().length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="selectedTab() === 'EXPENSE'"
          (click)="setTab('EXPENSE')"
        >
          Expenses ({{ countByType('EXPENSE') }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="selectedTab() === 'INCOME'"
          (click)="setTab('INCOME')"
        >
          Income ({{ countByType('INCOME') }})
        </button>
      </div>

      <!-- Error Toast / Alert -->
      @if (actionError()) {
        <div class="alert alert-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ actionError() }}</span>
        </div>
      }

      @if (isLoading()) {
        <app-loading-spinner message="Loading categories..."></app-loading-spinner>
      } @else if (filteredCategories().length === 0) {
        <app-empty-state
          title="No categories found"
          message="Create categories like Groceries, Salary, Utilities, or Rent to categorize your transactions."
          actionText="Create Category"
          (action)="openCreateModal()"
        ></app-empty-state>
      } @else {
        <!-- Category Grid -->
        <div class="category-grid">
          @for (cat of filteredCategories(); track cat.id) {
            <div class="category-card glass-card">
              <div class="cat-card-top">
                <div
                  class="cat-icon"
                  [class.icon-income]="cat.type === 'INCOME'"
                  [class.icon-expense]="cat.type === 'EXPENSE'"
                >
                  @if (cat.type === 'INCOME') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                    </svg>
                  } @else {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                    </svg>
                  }
                </div>
                <span class="badge" [class.badge-income]="cat.type === 'INCOME'" [class.badge-expense]="cat.type === 'EXPENSE'">
                  {{ cat.type }}
                </span>
              </div>

              <div class="cat-card-body">
                <h3 class="category-name">{{ cat.name }}</h3>
                <span class="category-meta">Created {{ cat.createdAt | date:'mediumDate' }}</span>
              </div>

              <div class="cat-card-actions">
                <button type="button" class="btn btn-secondary btn-sm" (click)="openEditModal(cat)">
                  Edit
                </button>
                <button type="button" class="btn btn-danger btn-sm" (click)="confirmDelete(cat)">
                  Delete
                </button>
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
              <h3 class="modal-title">{{ editingCategory() ? 'Edit Category' : 'Create New Category' }}</h3>
              <button type="button" class="btn-close" (click)="closeModal()">&times;</button>
            </div>

            <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
              <div class="form-group">
                <label class="form-label" for="catName">Category Name</label>
                <input
                  id="catName"
                  type="text"
                  class="form-input"
                  placeholder="e.g. Groceries, Rent, Freelance"
                  formControlName="name"
                />
                @if (categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched) {
                  <span class="form-error">Category name is required (max 60 chars)</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label" for="catType">Classification Type</label>
                <select
                  id="catType"
                  class="form-select"
                  formControlName="type"
                  [disabled]="!!editingCategory()"
                >
                  <option value="EXPENSE">EXPENSE</option>
                  <option value="INCOME">INCOME</option>
                </select>
                @if (editingCategory()) {
                  <span class="form-note">Category type cannot be changed after creation.</span>
                }
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="categoryForm.invalid || isSubmitting()"
                >
                  @if (isSubmitting()) {
                    Saving...
                  } @else {
                    {{ editingCategory() ? 'Update' : 'Create' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-dialog
        [isOpen]="isDeleteModalOpen()"
        title="Delete Category"
        [message]="'Are you sure you want to delete ' + categoryToDelete()?.name + '? Categories referenced by existing transactions cannot be deleted.'"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen.set(false)"
      ></app-confirm-dialog>
    </div>
  `,
  styles: [`
    .category-page {
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
    .tabs-bar {
      display: flex;
      gap: 0.5rem;
      padding: 0.4rem;
      border-radius: var(--radius-md);
      max-width: 450px;
    }
    .tab-btn {
      flex: 1;
      padding: 0.6rem 1rem;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.88rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .tab-btn:hover {
      color: var(--text-main);
    }
    .tab-btn.active {
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }
    .alert {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
    }
    .alert-error {
      background: rgba(244, 63, 94, 0.15);
      color: #fda4af;
      border: 1px solid rgba(244, 63, 94, 0.3);
    }
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .category-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border-radius: var(--radius-lg);
    }
    .cat-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .cat-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-income {
      background: var(--income-bg);
      color: var(--income);
    }
    .icon-expense {
      background: var(--expense-bg);
      color: var(--expense);
    }
    .category-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.2rem;
    }
    .category-meta {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .cat-card-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-subtle);
    }
    .btn-sm {
      padding: 0.4rem 0.85rem;
      font-size: 0.82rem;
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
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);

  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly selectedTab = signal<'ALL' | CategoryType>('ALL');

  readonly isModalOpen = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly editingCategory = signal<Category | null>(null);
  readonly actionError = signal<string>('');

  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly categoryToDelete = signal<Category | null>(null);

  categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    type: ['EXPENSE' as CategoryType, Validators.required]
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  setTab(tab: 'ALL' | CategoryType): void {
    this.selectedTab.set(tab);
  }

  countByType(type: CategoryType): number {
    return this.categories().filter((c) => c.type === type).length;
  }

  filteredCategories(): Category[] {
    const tab = this.selectedTab();
    if (tab === 'ALL') return this.categories();
    return this.categories().filter((c) => c.type === tab);
  }

  openCreateModal(): void {
    this.editingCategory.set(null);
    this.actionError.set('');
    this.categoryForm.reset({
      name: '',
      type: this.selectedTab() === 'INCOME' ? 'INCOME' : 'EXPENSE'
    });
    this.categoryForm.get('type')?.enable();
    this.isModalOpen.set(true);
  }

  openEditModal(cat: Category): void {
    this.editingCategory.set(cat);
    this.actionError.set('');
    this.categoryForm.patchValue({
      name: cat.name,
      type: cat.type
    });
    this.categoryForm.get('type')?.disable();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingCategory.set(null);
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) return;

    this.isSubmitting.set(true);
    this.actionError.set('');
    const formVal = this.categoryForm.getRawValue();

    const editing = this.editingCategory();
    if (editing) {
      this.categoryService.updateCategory(editing.id, {
        name: formVal.name!,
        type: editing.type
      }).subscribe({
        next: (updated) => {
          this.categories.update((list) =>
            list.map((c) => (c.id === updated.id ? updated : c))
          );
          this.isSubmitting.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.actionError.set(err.error?.message || 'Failed to update category');
        }
      });
    } else {
      this.categoryService.createCategory({
        name: formVal.name!,
        type: formVal.type!
      }).subscribe({
        next: (created) => {
          this.categories.update((list) => [...list, created]);
          this.isSubmitting.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.actionError.set(err.error?.message || 'Failed to create category');
        }
      });
    }
  }

  confirmDelete(cat: Category): void {
    this.actionError.set('');
    this.categoryToDelete.set(cat);
    this.isDeleteModalOpen.set(true);
  }

  executeDelete(): void {
    const cat = this.categoryToDelete();
    if (!cat) return;

    this.isDeleteModalOpen.set(false);
    this.categoryService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((c) => c.id !== cat.id));
        this.categoryToDelete.set(null);
      },
      error: (err) => {
        this.actionError.set(
          err.error?.message || 'Cannot delete category because it is referenced by existing transactions or budgets.'
        );
        this.categoryToDelete.set(null);
      }
    });
  }
}
