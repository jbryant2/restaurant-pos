import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem } from './menu.service';

export interface InventoryItem {
  id: number;
  menuItem: MenuItem;
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string;
  lowStock: boolean;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly api = 'http://localhost:8080/api/inventory';
  private http = inject(HttpClient);

  getAll(): Observable<InventoryItem[]> { return this.http.get<InventoryItem[]>(this.api); }
  getLowStock(): Observable<InventoryItem[]> { return this.http.get<InventoryItem[]>(`${this.api}/low-stock`); }
  create(menuItemId: number, stockQuantity: number, lowStockThreshold: number, unit: string): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.api, { menuItemId, stockQuantity, lowStockThreshold, unit });
  }
  adjustStock(menuItemId: number, adjustment: number): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.api}/menu-item/${menuItemId}/adjust?adjustment=${adjustment}`, {});
  }
}
