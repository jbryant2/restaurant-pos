import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { TableService, RestaurantTable, TableStatus } from '../../services/table.service';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatChipsModule, MatProgressBarModule, MatDividerModule
  ],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss'
})
export class TablesComponent implements OnInit {
  private tableService = inject(TableService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  tables = signal<RestaurantTable[]>([]);
  loading = signal(true);
  showForm = signal(false);

  readonly statuses: TableStatus[] = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];

  tableForm = this.fb.group({
    tableNumber: ['', Validators.required],
    capacity: [4, [Validators.required, Validators.min(1)]],
    location: [''],
    status: ['AVAILABLE' as TableStatus]
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.tableService.getAll().subscribe({
      next: t => { this.tables.set(t); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  addTable(): void {
    if (this.tableForm.invalid) return;
    const v = this.tableForm.value;
    this.tableService.create({ tableNumber: v.tableNumber!, capacity: v.capacity!, location: v.location!, status: v.status! }).subscribe({
      next: () => { this.load(); this.showForm.set(false); this.tableForm.reset({ capacity: 4, status: 'AVAILABLE' }); this.snackBar.open('Table added', 'OK', { duration: 2000 }); },
      error: () => this.snackBar.open('Failed to add table', 'OK', { duration: 3000 })
    });
  }

  updateStatus(table: RestaurantTable, status: TableStatus): void {
    this.tableService.updateStatus(table.id, status).subscribe({
      next: updated => this.tables.update(ts => ts.map(t => t.id === updated.id ? updated : t)),
      error: () => this.snackBar.open('Failed to update status', 'OK', { duration: 3000 })
    });
  }

  deleteTable(id: number): void {
    if (!confirm('Delete this table?')) return;
    this.tableService.delete(id).subscribe({
      next: () => { this.tables.update(ts => ts.filter(t => t.id !== id)); this.snackBar.open('Table deleted', 'OK', { duration: 2000 }); },
      error: () => this.snackBar.open('Failed to delete table', 'OK', { duration: 3000 })
    });
  }

  statusLabel(s: TableStatus): string {
    return s.charAt(0) + s.slice(1).toLowerCase();
  }
}
