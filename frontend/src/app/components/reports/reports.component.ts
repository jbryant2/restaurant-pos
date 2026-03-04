import { Component, inject, signal, OnInit } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ReportsService, SalesSummary, TopSellingItem } from '../../services/reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CurrencyPipe, PercentPipe, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatCardModule, MatTableModule, MatProgressBarModule, MatDividerModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  private reportsService = inject(ReportsService);

  summary = signal<SalesSummary | null>(null);
  topItems = signal<TopSellingItem[]>([]);
  rangeRevenue = signal<number | null>(null);
  loading = signal(true);
  rangeLoading = signal(false);

  startDate = '';
  endDate = '';

  topColumns = ['rank', 'name', 'category', 'quantity', 'revenue'];

  ngOnInit(): void {
    this.reportsService.getSummary().subscribe({
      next: s => { this.summary.set(s); this.topItems.set(s.topItems); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  queryRange(): void {
    if (!this.startDate || !this.endDate) return;
    this.rangeLoading.set(true);
    this.reportsService.getRevenue(this.startDate, this.endDate).subscribe({
      next: rev => { this.rangeRevenue.set(rev); this.rangeLoading.set(false); },
      error: () => this.rangeLoading.set(false)
    });
  }

  completionRate(): number {
    const s = this.summary();
    if (!s || s.totalOrders === 0) return 0;
    return s.completedOrders / s.totalOrders;
  }
}
