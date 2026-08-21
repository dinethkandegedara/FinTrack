import { Budget } from '../budgets/budget.model';

/**
 * Category spending summary item for dashboard charts/breakdowns.
 */
export interface CategorySpendingSummary {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
  percentage: number;
}

/**
 * Monthly Dashboard Financial Summary model matching backend DashboardSummaryResponse.
 */
export interface DashboardSummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  budgets: Budget[];
  topExpenseCategories: CategorySpendingSummary[];
}
