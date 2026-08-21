/**
 * Category type classification.
 */
export type CategoryType = 'INCOME' | 'EXPENSE';

/**
 * Category domain model matching backend CategoryResponse.
 */
export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  createdAt: string;
}

/**
 * Request payload for creating or updating a category.
 */
export interface CategoryRequest {
  name: string;
  type: CategoryType;
}
