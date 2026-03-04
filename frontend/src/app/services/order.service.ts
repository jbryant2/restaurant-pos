import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RestaurantTable } from './table.service';
import { MenuItem } from './menu.service';

export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: number;
  table: RestaurantTable;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = 'http://localhost:8080/api/orders';
  private http = inject(HttpClient);

  getAll(): Observable<Order[]> { return this.http.get<Order[]>(this.api); }
  getById(id: number): Observable<Order> { return this.http.get<Order>(`${this.api}/${id}`); }
  getByTable(tableId: number): Observable<Order[]> { return this.http.get<Order[]>(`${this.api}/table/${tableId}`); }
  getByStatus(status: OrderStatus): Observable<Order[]> { return this.http.get<Order[]>(`${this.api}/status/${status}`); }
  create(tableId: number, notes?: string): Observable<Order> { return this.http.post<Order>(this.api, { tableId, notes }); }
  addItem(orderId: number, menuItemId: number, quantity: number, notes?: string): Observable<OrderItem> {
    return this.http.post<OrderItem>(`${this.api}/${orderId}/items`, { menuItemId, quantity, notes });
  }
  removeItem(orderId: number, itemId: number): Observable<void> { return this.http.delete<void>(`${this.api}/${orderId}/items/${itemId}`); }
  updateStatus(orderId: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.api}/${orderId}/status?status=${status}`, {});
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
}
