import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TopSellingItem {
  itemName: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  topItems: TopSellingItem[];
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly api = 'http://localhost:8080/api/reports';
  private http = inject(HttpClient);

  getSummary(): Observable<SalesSummary> { return this.http.get<SalesSummary>(`${this.api}/summary`); }
  getTopItems(limit = 10): Observable<TopSellingItem[]> { return this.http.get<TopSellingItem[]>(`${this.api}/top-items?limit=${limit}`); }
  getRevenue(start: string, end: string): Observable<number> { return this.http.get<number>(`${this.api}/revenue?start=${start}&end=${end}`); }
}
