import { Category } from '../categories/category.model';

/**
 * Monthly Category Budget domain model matching backend BudgetResponse.
 */
export interface Budget {
  id: number;
  category: Category;
  budgetYear: number;
  budgetMonth: number;
  amount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  createdAt: string;
}

/**
 * Request payload for creating or updating a monthly budget.
 */
export interface BudgetRequest {
  categoryId: number;
  budgetYear: number;
  budgetMonth: number;
  amount: number;
}
