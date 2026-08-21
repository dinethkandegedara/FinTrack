import { Category, CategoryType } from '../categories/category.model';

/**
 * Financial Transaction domain model matching backend TransactionResponse.
 */
export interface Transaction {
  id: number;
  amount: number;
  transactionDate: string;
  description?: string;
  category: Category;
  type: CategoryType;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Request payload for creating or updating a transaction.
 */
export interface TransactionRequest {
  categoryId: number;
  amount: number;
  transactionDate: string;
  description?: string;
}

/**
 * Search and filter criteria for transaction queries.
 */
export interface TransactionFilter {
  type?: CategoryType;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Generic Spring Data Page response model.
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
