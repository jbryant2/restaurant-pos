import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../services/order.service';
import { RestaurantTable } from '../../services/table.service';
import { MenuItem } from '../../services/menu.service';

interface DialogData {
  tables: RestaurantTable[];
  menuItems: MenuItem[];
}

interface PendingItem {
  menuItem: MenuItem;
  quantity: number;
}

@Component({
  selector: 'app-new-order-dialog',
  standalone: true,
  imports: [
    FormsModule, CurrencyPipe,
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatIconModule, MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>New Order</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Table</mat-label>
        <mat-select [(ngModel)]="selectedTableId">
          @for (t of data.tables; track t.id) {
            @if (t.status === 'AVAILABLE' || t.status === 'OCCUPIED') {
              <mat-option [value]="t.id">{{ t.tableNumber }} ({{ t.status }})</mat-option>
            }
          }
        </mat-select>
      </mat-form-field>

      <mat-divider />
      <p class="section-label">Add Items</p>

      <div class="add-item-row">
        <mat-form-field appearance="outline" class="item-select">
          <mat-label>Menu Item</mat-label>
          <mat-select [(ngModel)]="selectedMenuItemId">
            @for (item of data.menuItems; track item.id) {
              <mat-option [value]="item.id">{{ item.name }} — {{ item.price | currency }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="qty-field">
          <mat-label>Qty</mat-label>
          <input matInput type="number" min="1" [(ngModel)]="addQty">
        </mat-form-field>
        <button mat-icon-button (click)="addItem()" [disabled]="!selectedMenuItemId">
          <mat-icon>add_circle</mat-icon>
        </button>
      </div>

      @if (pendingItems().length) {
        <mat-divider />
        <div class="pending-list">
          @for (pi of pendingItems(); track pi.menuItem.id) {
            <div class="pending-item">
              <span>{{ pi.menuItem.name }} × {{ pi.quantity }}</span>
              <span>{{ pi.menuItem.price * pi.quantity | currency }}</span>
              <button mat-icon-button color="warn" (click)="removePending(pi)">
                <mat-icon>remove_circle</mat-icon>
              </button>
            </div>
          }
          <div class="pending-total">Total: {{ pendingTotal() | currency }}</div>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button (click)="submit()" [disabled]="!selectedTableId || !pendingItems().length || submitting()">
        Create Order
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-top: 1rem; }
    .section-label { margin: 0.75rem 0 0.5rem; font-size: 0.875rem; font-weight: 500; color: var(--mat-sys-on-surface-variant); }
    .add-item-row { display: flex; gap: 0.5rem; align-items: center; }
    .item-select { flex: 1; }
    .qty-field { width: 80px; }
    .pending-list { margin-top: 0.5rem; }
    .pending-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; }
    .pending-item span:first-child { flex: 1; }
    .pending-total { text-align: right; font-weight: 600; padding: 0.5rem 0; }
  `]
})
export class NewOrderDialogComponent {
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<NewOrderDialogComponent>);
  data: DialogData = inject(MAT_DIALOG_DATA);

  selectedTableId: number | null = null;
  selectedMenuItemId: number | null = null;
  addQty = 1;
  submitting = signal(false);
  pendingItems = signal<PendingItem[]>([]);

  pendingTotal = () => this.pendingItems().reduce((sum, pi) => sum + pi.menuItem.price * pi.quantity, 0);

  addItem(): void {
    const item = this.data.menuItems.find(m => m.id === this.selectedMenuItemId);
    if (!item) return;
    this.pendingItems.update(list => {
      const existing = list.find(pi => pi.menuItem.id === item.id);
      if (existing) return list.map(pi => pi.menuItem.id === item.id ? { ...pi, quantity: pi.quantity + this.addQty } : pi);
      return [...list, { menuItem: item, quantity: this.addQty }];
    });
    this.selectedMenuItemId = null;
    this.addQty = 1;
  }

  removePending(pi: PendingItem): void {
    this.pendingItems.update(list => list.filter(p => p.menuItem.id !== pi.menuItem.id));
  }

  submit(): void {
    if (!this.selectedTableId) return;
    this.submitting.set(true);
    this.orderService.create(this.selectedTableId).subscribe({
      next: order => {
        const items = this.pendingItems();
        let completed = 0;
        for (const pi of items) {
          this.orderService.addItem(order.id, pi.menuItem.id!, pi.quantity).subscribe({
            next: () => {
              completed++;
              if (completed === items.length) {
                this.submitting.set(false);
                this.dialogRef.close(true);
              }
            },
            error: () => {
              this.submitting.set(false);
              this.snackBar.open('Failed to add some items', 'OK', { duration: 3000 });
            }
          });
        }
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open('Failed to create order', 'OK', { duration: 3000 });
      }
    });
  }
}
