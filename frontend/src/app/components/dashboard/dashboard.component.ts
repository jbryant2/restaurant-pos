import { Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { TableService, RestaurantTable } from '../../services/table.service';
import { OrderService, Order } from '../../services/order.service';
import { ReportsService } from '../../services/reports.service';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule, MatIconModule, MatChipsModule,
    MatProgressBarModule, MatDividerModule, RouterLink,
    CurrencyPipe, DatePipe, TitleCasePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private tableService = inject(TableService);
  private orderService = inject(OrderService);
  private reportsService = inject(ReportsService);

  tables = signal<RestaurantTable[]>([]);
  activeOrders = signal<Order[]>([]);
  totalRevenue = signal<number>(0);
  loading = signal(true);

  get availableTables() { return this.tables().filter(t => t.status === 'AVAILABLE').length; }
  get occupiedTables() { return this.tables().filter(t => t.status === 'OCCUPIED').length; }

  ngOnInit(): void {
    this.tableService.getAll().subscribe(t => this.tables.set(t));
    this.orderService.getAll().subscribe(orders => {
      this.activeOrders.set(orders.filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS' || o.status === 'READY'));
      this.loading.set(false);
    });
    this.reportsService.getSummary().subscribe(s => this.totalRevenue.set(s.totalRevenue));
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'warn', IN_PROGRESS: 'primary', READY: 'accent', COMPLETED: '', CANCELLED: ''
    };
    return map[status] ?? '';
  }
}
