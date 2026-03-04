import { Component, inject, signal, OnInit } from '@angular/core';
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
import { InventoryService, InventoryItem } from '../../services/inventory.service';
import { MenuService, MenuItem } from '../../services/menu.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCardModule, MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private menuService = inject(MenuService);
  private snackBar = inject(MatSnackBar);

  items = signal<InventoryItem[]>([]);
  menuItems = signal<MenuItem[]>([]);
  loading = signal(true);
  showAddForm = signal(false);
  adjustments: Record<number, number | undefined> = {};

  // Add form fields
  newMenuItemId: number | null = null;
  newStock = 0;
  newThreshold = 5;
  newUnit = 'units';

  displayedColumns = ['item', 'stock', 'threshold', 'unit', 'status', 'adjust'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.inventoryService.getAll().subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.menuService.getAll().subscribe(m => this.menuItems.set(m));
  }

  get availableMenuItems(): MenuItem[] {
    const tracked = new Set(this.items().map(i => i.menuItem.id));
    return this.menuItems().filter(m => !tracked.has(m.id));
  }

  addInventory(): void {
    if (!this.newMenuItemId) return;
    this.inventoryService.create(this.newMenuItemId, this.newStock, this.newThreshold, this.newUnit).subscribe({
      next: () => {
        this.load();
        this.showAddForm.set(false);
        this.newMenuItemId = null;
        this.newStock = 0;
        this.newThreshold = 5;
        this.newUnit = 'units';
        this.snackBar.open('Inventory item added', 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to add', 'OK', { duration: 3000 })
    });
  }

  applyAdjustment(item: InventoryItem): void {
    const adj = this.adjustments[item.id] ?? 0;
    if (!adj) return;
    this.inventoryService.adjustStock(item.menuItem.id!, adj).subscribe({
      next: updated => {
        this.items.update(list => list.map(i => i.id === updated.id ? updated : i));
        this.adjustments[item.id] = 0;
        this.snackBar.open(`Stock ${adj > 0 ? 'added' : 'removed'}`, 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Adjust failed', 'OK', { duration: 3000 })
    });
  }
}
