import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Budget, BudgetRequest } from './budget.model';

/**
 * Budget Service interacting with /api/budgets endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/budgets`;

  /**
   * Lists monthly budgets with live computed spent/remaining data.
   */
  getBudgets(year?: number, month?: number): Observable<Budget[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());

    return this.http.get<Budget[]>(this.apiUrl, { params });
  }

  /**
   * Retrieves a single budget by ID.
   */
  getBudget(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new monthly budget.
   */
  createBudget(request: BudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, request);
  }

  /**
   * Updates an existing budget's target amount.
   */
  updateBudget(id: number, request: BudgetRequest): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Deletes a monthly budget.
   */
  deleteBudget(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
