import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { OrderService, Order, OrderStatus } from '../../services/order.service';
import { TableService, RestaurantTable } from '../../services/table.service';
import { MenuService, MenuItem } from '../../services/menu.service';
import { NewOrderDialogComponent } from './new-order-dialog.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCardModule, MatChipsModule,
    MatProgressBarModule, MatDialogModule, MatDividerModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private tableService = inject(TableService);
  private menuService = inject(MenuService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  orders = signal<Order[]>([]);
  tables = signal<RestaurantTable[]>([]);
  menuItems = signal<MenuItem[]>([]);
  loading = signal(true);
  selectedStatus = signal<OrderStatus | 'ALL'>('ALL');
  expandedOrderId = signal<number | null>(null);

  readonly statuses: OrderStatus[] = ['PENDING', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'];
  readonly filterStatuses = ['ALL', ...this.statuses] as const;
  displayedColumns = ['table', 'status', 'items', 'total', 'time', 'actions'];

  filteredOrders = computed(() => {
    const s = this.selectedStatus();
    return s === 'ALL' ? this.orders() : this.orders().filter(o => o.status === s);
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.orderService.getAll().subscribe({
      next: orders => {
        this.orders.set(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
    this.tableService.getAll().subscribe(t => this.tables.set(t));
    this.menuService.getAvailable().subscribe(m => this.menuItems.set(m));
  }

  openNewOrder(): void {
    const ref = this.dialog.open(NewOrderDialogComponent, {
      width: '500px',
      data: { tables: this.tables(), menuItems: this.menuItems() }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.load();
    });
  }

  updateStatus(order: Order, status: OrderStatus): void {
    this.orderService.updateStatus(order.id, status).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.snackBar.open(`Order status updated to ${this.statusLabel(status)}`, 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Update failed', 'OK', { duration: 3000 })
    });
  }

  removeItem(order: Order, itemId: number): void {
    this.orderService.removeItem(order.id, itemId).subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Item removed', 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Remove failed', 'OK', { duration: 3000 })
    });
  }

  deleteOrder(id: number): void {
    if (!confirm('Delete this order?')) return;
    this.orderService.delete(id).subscribe({
      next: () => {
        this.orders.update(list => list.filter(o => o.id !== id));
        this.snackBar.open('Order deleted', 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Delete failed', 'OK', { duration: 3000 })
    });
  }

  toggleExpand(id: number): void {
    this.expandedOrderId.update(curr => curr === id ? null : id);
  }

  statusLabel(s: OrderStatus | 'ALL'): string {
    const map: Record<string, string> = {
      ALL: 'All Orders', PENDING: 'Pending', IN_PROGRESS: 'In Progress',
      READY: 'Ready', COMPLETED: 'Completed', CANCELLED: 'Cancelled'
    };
    return map[s] ?? s;
  }

  nextStatus(current: OrderStatus): OrderStatus | null {
    const flow: Partial<Record<OrderStatus, OrderStatus>> = {
      PENDING: 'IN_PROGRESS', IN_PROGRESS: 'READY', READY: 'COMPLETED'
    };
    return flow[current] ?? null;
  }
}
