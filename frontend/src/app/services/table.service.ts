import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RestaurantTable {
  id?: number;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  location?: string;
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE'
}

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = 'http://localhost:8080/api/tables';

  constructor(private http: HttpClient) { }

  getAllTables(): Observable<RestaurantTable[]> {
    return this.http.get<RestaurantTable[]>(this.apiUrl);
  }

  getTableById(id: number): Observable<RestaurantTable> {
    return this.http.get<RestaurantTable>(`${this.apiUrl}/${id}`);
  }

  getTablesByStatus(status: TableStatus): Observable<RestaurantTable[]> {
    return this.http.get<RestaurantTable[]>(`${this.apiUrl}/status/${status}`);
  }

  getAvailableTablesForPartySize(partySize: number): Observable<RestaurantTable[]> {
    return this.http.get<RestaurantTable[]>(`${this.apiUrl}/available/${partySize}`);
  }

  createTable(table: RestaurantTable): Observable<RestaurantTable> {
    return this.http.post<RestaurantTable>(this.apiUrl, table);
  }

  updateTable(id: number, table: RestaurantTable): Observable<RestaurantTable> {
    return this.http.put<RestaurantTable>(`${this.apiUrl}/${id}`, table);
  }

  updateTableStatus(id: number, status: TableStatus): Observable<RestaurantTable> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<RestaurantTable>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  deleteTable(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}