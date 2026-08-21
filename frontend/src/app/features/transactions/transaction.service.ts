import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse, Transaction, TransactionFilter, TransactionRequest } from './transaction.model';

/**
 * Transaction Service managing backend REST calls for transaction CRUD, dynamic filtering, and pagination.
 */
@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/transactions`;

  /**
   * Retrieves a paginated and filtered list of transactions.
   */
  getTransactions(filter?: TransactionFilter): Observable<PaginatedResponse<Transaction>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.type) params = params.set('type', filter.type);
      if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.keyword) params = params.set('keyword', filter.keyword);
      if (filter.page !== undefined) params = params.set('page', filter.page.toString());
      if (filter.size !== undefined) params = params.set('size', filter.size.toString());
      if (filter.sort) params = params.set('sort', filter.sort);
    }

    return this.http.get<PaginatedResponse<Transaction>>(this.apiUrl, { params });
  }

  /**
   * Retrieves a single transaction by ID.
   */
  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new financial transaction.
   */
  createTransaction(request: TransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, request);
  }

  /**
   * Updates an existing transaction.
   */
  updateTransaction(id: number, request: TransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Deletes a transaction.
   */
  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
