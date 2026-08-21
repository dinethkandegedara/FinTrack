import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { DashboardSummary } from './dashboard.model';
import { CurrencySignPipe } from '../../shared/pipes/currency-sign.pipe';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

/**
 * Dashboard Component rendering the executive personal finance overview for a selected month.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencySignPipe, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="dashboard-page">
      <!-- Header with month selector -->
      <header class="page-header">
        <div>
          <h1 class="page-title">Financial Dashboard</h1>
          <p class="page-subtitle">Overview of your income, expenses, and budget performance</p>
        </div>

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
      </header>

      @if (isLoading()) {
        <app-loading-spinner message="Aggregating monthly financial data..."></app-loading-spinner>
      } @else if (summary(); as data) {
        <!-- Metric Summary Cards -->
        <section class="metrics-grid">
          <!-- Total Income -->
          <div class="metric-card glass-card income-border">
            <div class="metric-header">
              <span class="metric-label">Total Income</span>
              <div class="metric-icon income-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
              </div>
            </div>
            <div class="metric-value income-text">{{ data.totalIncome | currencySign:true }}</div>
            <div class="metric-footer">
              <span class="metric-note">Recorded for {{ getMonthName(data.month) }}</span>
            </div>
          </div>

          <!-- Total Expenses -->
          <div class="metric-card glass-card expense-border">
            <div class="metric-header">
              <span class="metric-label">Total Expenses</span>
              <div class="metric-icon expense-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19 12 12 19 5 12"/>
                </svg>
              </div>
            </div>
            <div class="metric-value expense-text">{{ data.totalExpense | currencySign:true }}</div>
            <div class="metric-footer">
              <span class="metric-note">Recorded for {{ getMonthName(data.month) }}</span>
            </div>
          </div>

          <!-- Net Balance -->
          <div class="metric-card glass-card balance-border">
            <div class="metric-header">
              <span class="metric-label">Net Balance / Savings</span>
              <div class="metric-icon balance-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
            </div>
            <div class="metric-value" [class.income-text]="data.balance >= 0" [class.expense-text]="data.balance < 0">
              {{ data.balance | currencySign }}
            </div>
            <div class="metric-footer">
              <span class="metric-note">
                Savings Rate: {{ calculateSavingsRate(data.totalIncome, data.totalExpense) }}%
              </span>
            </div>
          </div>

          <!-- Transactions Count -->
          <div class="metric-card glass-card">
            <div class="metric-header">
              <span class="metric-label">Total Transactions</span>
              <div class="metric-icon default-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
            </div>
            <div class="metric-value">{{ data.transactionCount }}</div>
            <div class="metric-footer">
              <a routerLink="/transactions" class="metric-link">View all &rarr;</a>
            </div>
          </div>
        </section>

        <!-- Two Columns: Category Spending Breakdown & Budgets Overview -->
        <div class="dashboard-grid">
          <!-- Top Spending Categories -->
          <div class="glass-card section-card">
            <div class="section-header">
              <h3 class="section-title">Expense Breakdown by Category</h3>
              <a routerLink="/transactions" class="section-link">Explore details</a>
            </div>

            @if (data.topExpenseCategories.length === 0) {
              <app-empty-state
                title="No expenses this month"
                message="Add transactions to view category distribution breakdown."
              ></app-empty-state>
            } @else {
              <div class="category-list">
                @for (cat of data.topExpenseCategories; track cat.categoryId) {
                  <div class="category-item">
                    <div class="cat-info">
                      <span class="cat-name">{{ cat.categoryName }}</span>
                      <span class="cat-amount">{{ cat.totalAmount | currencySign }} ({{ cat.percentage }}%)</span>
                    </div>
                    <div class="progress-bar-bg">
                      <div
                        class="progress-bar-fill"
                        [style.width.%]="cat.percentage"
                        [style.background]="getCategoryColor($index)"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Monthly Budget Tracking -->
          <div class="glass-card section-card">
            <div class="section-header">
              <h3 class="section-title">Budget Health &amp; Limits</h3>
              <a routerLink="/budgets" class="section-link">Manage budgets</a>
            </div>

            @if (data.budgets.length === 0) {
              <app-empty-state
                title="No budgets configured"
                message="Set spending goals for this month to prevent overspending."
                actionText="Create Budget"
                (action)="navigateToBudgets()"
              ></app-empty-state>
            } @else {
              <div class="budget-items">
                @for (budget of data.budgets; track budget.id) {
                  <div class="budget-item">
                    <div class="budget-top">
                      <div class="budget-category-label">
                        <span class="budget-cat-name">{{ budget.category.name }}</span>
                        @if (budget.percentUsed > 100) {
                          <span class="badge badge-expense">Over Budget</span>
                        } @else if (budget.percentUsed >= 80) {
                          <span class="badge badge-warning">Near Limit</span>
                        }
                      </div>
                      <span class="budget-figures">
                        <strong>{{ budget.spent | currencySign }}</strong> / {{ budget.amount | currencySign }}
                      </span>
                    </div>

                    <div class="progress-bar-bg">
                      <div
                        class="progress-bar-fill"
                        [class.fill-green]="budget.percentUsed < 80"
                        [class.fill-yellow]="budget.percentUsed >= 80 && budget.percentUsed <= 100"
                        [class.fill-red]="budget.percentUsed > 100"
                        [style.width.%]="getClampedPercent(budget.percentUsed)"
                      ></div>
                    </div>

                    <div class="budget-bottom">
                      <span class="budget-used-text">{{ budget.percentUsed }}% utilized</span>
                      <span class="budget-rem-text">
                        @if (budget.remaining >= 0) {
                          {{ budget.remaining | currencySign }} remaining
                        } @else {
                          {{ -budget.remaining | currencySign }} over limit
                        }
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
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
      letter-spacing: -0.02em;
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
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }
    .metric-card {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .metric-card.income-border {
      border-left: 4px solid var(--income);
    }
    .metric-card.expense-border {
      border-left: 4px solid var(--expense);
    }
    .metric-card.balance-border {
      border-left: 4px solid var(--primary);
    }
    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .metric-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .income-icon {
      background: var(--income-bg);
      color: var(--income);
    }
    .expense-icon {
      background: var(--expense-bg);
      color: var(--expense);
    }
    .balance-icon {
      background: var(--primary-light);
      color: #818cf8;
    }
    .default-icon {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
    }
    .metric-value {
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .income-text {
      color: var(--income);
    }
    .expense-text {
      color: var(--expense);
    }
    .metric-footer {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .metric-link {
      color: #818cf8;
      text-decoration: none;
      font-weight: 600;
    }
    .metric-link:hover {
      text-decoration: underline;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 1.5rem;
    }
    .section-card {
      padding: 1.75rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f1f5f9;
    }
    .section-link {
      font-size: 0.85rem;
      font-weight: 600;
      color: #818cf8;
      text-decoration: none;
    }
    .section-link:hover {
      text-decoration: underline;
    }
    .category-list, .budget-items {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .cat-info, .budget-top, .budget-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.4rem;
    }
    .cat-name, .budget-cat-name {
      font-weight: 600;
      font-size: 0.92rem;
      color: var(--text-main);
    }
    .cat-amount, .budget-figures {
      font-size: 0.88rem;
      color: var(--text-secondary);
    }
    .progress-bar-bg {
      width: 100%;
      height: 8px;
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
    .budget-bottom {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.4rem;
      margin-bottom: 0;
    }
    .badge-warning {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly currentDate = new Date();
  readonly selectedYear = signal<number>(this.currentDate.getFullYear());
  readonly selectedMonth = signal<number>(this.currentDate.getMonth() + 1);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly isLoading = signal<boolean>(true);

  private readonly colors = [
    '#f43f5e', '#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#3b82f6'
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.dashboardService.getMonthlySummary(this.selectedYear(), this.selectedMonth()).subscribe({
      next: (data) => {
        this.summary.set(data);
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
    this.loadDashboardData();
  }

  getMonthName(monthNum: number): string {
    const date = new Date(2026, monthNum - 1, 1);
    return date.toLocaleString('default', { month: 'long' });
  }

  calculateSavingsRate(income: number, expense: number): number {
    if (!income || income <= 0) return 0;
    const savings = income - expense;
    return Math.max(0, Math.round((savings / income) * 100));
  }

  getClampedPercent(percent: number): number {
    return Math.min(100, Math.max(0, percent));
  }

  getCategoryColor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  navigateToBudgets(): void {
    // Handled by router
  }
}
