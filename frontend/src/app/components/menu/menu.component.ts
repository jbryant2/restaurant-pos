import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyPipe } from '@angular/common';
import { MenuService, MenuItem } from '../../services/menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    ReactiveFormsModule, CurrencyPipe,
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCardModule, MatChipsModule,
    MatSlideToggleModule, MatProgressBarModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
  private menuService = inject(MenuService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  items = signal<MenuItem[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  selectedCategory = signal<string>('All');

  categories = computed(() => ['All', ...new Set(this.items().map(i => i.category).filter(Boolean))]);
  filteredItems = computed(() => this.selectedCategory() === 'All' ? this.items() : this.items().filter(i => i.category === this.selectedCategory()));

  displayedColumns = ['name', 'category', 'price', 'available', 'actions'];

  itemForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    category: ['', Validators.required],
    available: [true]
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.menuService.getAll().subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  editItem(item: MenuItem): void {
    this.editingId.set(item.id!);
    this.showForm.set(true);
    this.itemForm.patchValue(item);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.itemForm.reset({ available: true, price: 0 });
  }

  saveItem(): void {
    if (this.itemForm.invalid) return;
    const v = this.itemForm.value as Partial<MenuItem>;
    const id = this.editingId();
    const call = id ? this.menuService.update(id, v) : this.menuService.create(v);
    call.subscribe({
      next: () => { this.load(); this.cancelForm(); this.snackBar.open(id ? 'Item updated' : 'Item added', 'OK', { duration: 2000 }); },
      error: () => this.snackBar.open('Save failed', 'OK', { duration: 3000 })
    });
  }

  toggleAvailable(item: MenuItem): void {
    this.menuService.update(item.id!, { ...item, available: !item.available }).subscribe({
      next: updated => this.items.update(list => list.map(i => i.id === updated.id ? updated : i))
    });
  }

  deleteItem(id: number): void {
    if (!confirm('Delete this menu item?')) return;
    this.menuService.delete(id).subscribe({
      next: () => { this.items.update(list => list.filter(i => i.id !== id)); this.snackBar.open('Item deleted', 'OK', { duration: 2000 }); },
      error: () => this.snackBar.open('Delete failed', 'OK', { duration: 3000 })
    });
  }
}
