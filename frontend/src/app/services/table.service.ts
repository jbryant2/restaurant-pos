import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export interface RestaurantTable {
  id: number;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  location: string;
}

@Injectable({ providedIn: 'root' })
export class TableService {
  private readonly api = 'http://localhost:8080/api/tables';
  private http = inject(HttpClient);

  getAll(): Observable<RestaurantTable[]> { return this.http.get<RestaurantTable[]>(this.api); }
  getById(id: number): Observable<RestaurantTable> { return this.http.get<RestaurantTable>(`${this.api}/${id}`); }
  create(t: Partial<RestaurantTable>): Observable<RestaurantTable> { return this.http.post<RestaurantTable>(this.api, t); }
  update(id: number, t: Partial<RestaurantTable>): Observable<RestaurantTable> { return this.http.put<RestaurantTable>(`${this.api}/${id}`, t); }
  updateStatus(id: number, status: TableStatus): Observable<RestaurantTable> { return this.http.patch<RestaurantTable>(`${this.api}/${id}/status?status=${status}`, {}); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
}
