import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardSummary } from './dashboard.model';

/**
 * Dashboard Service fetching aggregated monthly financial metrics from the backend.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  /**
   * Retrieves dashboard summary for a specific year and month.
   */
  getMonthlySummary(year?: number, month?: number): Observable<DashboardSummary> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());

    return this.http.get<DashboardSummary>(this.apiUrl, { params });
  }
}
