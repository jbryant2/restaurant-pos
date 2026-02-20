import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableService, RestaurantTable, TableStatus } from '../../../services/table.service';

@Component({
  selector: 'app-table-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-management.html',
  styleUrls: ['./table-management.scss']
})
export class TableManagementComponent implements OnInit {
  tables: RestaurantTable[] = [];
  showAddForm = false;
  editingTable: RestaurantTable | null = null;
  
  // Form model
  tableForm: RestaurantTable = {
    tableNumber: '',
    capacity: 2,
    status: TableStatus.AVAILABLE,
    location: ''
  };

  // Expose enum to template
  tableStatuses = Object.values(TableStatus);

  constructor(private tableService: TableService) { }

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.tableService.getAllTables().subscribe({
      next: (tables) => {
        this.tables = tables;
      },
      error: (error) => {
        console.error('Error loading tables:', error);
        alert('Failed to load tables');
      }
    });
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.editingTable = null;
    this.resetForm();
  }

  openEditForm(table: RestaurantTable): void {
    this.showAddForm = true;
    this.editingTable = table;
    this.tableForm = { ...table };
  }

  closeForm(): void {
    this.showAddForm = false;
    this.editingTable = null;
    this.resetForm();
  }

  resetForm(): void {
    this.tableForm = {
      tableNumber: '',
      capacity: 2,
      status: TableStatus.AVAILABLE,
      location: ''
    };
  }

  saveTable(): void {
    if (!this.tableForm.tableNumber || !this.tableForm.capacity) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.editingTable && this.editingTable.id) {
      // Update existing table
      this.tableService.updateTable(this.editingTable.id, this.tableForm).subscribe({
        next: () => {
          this.loadTables();
          this.closeForm();
        },
        error: (error) => {
          console.error('Error updating table:', error);
          alert('Failed to update table');
        }
      });
    } else {
      // Create new table
      this.tableService.createTable(this.tableForm).subscribe({
        next: () => {
          this.loadTables();
          this.closeForm();
        },
        error: (error) => {
          console.error('Error creating table:', error);
          alert('Failed to create table');
        }
      });
    }
  }

  deleteTable(table: RestaurantTable): void {
    if (!table.id) return;
    
    if (confirm(`Are you sure you want to delete ${table.tableNumber}?`)) {
      this.tableService.deleteTable(table.id).subscribe({
        next: () => {
          this.loadTables();
        },
        error: (error) => {
          console.error('Error deleting table:', error);
          alert('Failed to delete table');
        }
      });
    }
  }

  updateStatus(table: RestaurantTable, newStatus: TableStatus): void {
    if (!table.id) return;

    this.tableService.updateTableStatus(table.id, newStatus).subscribe({
      next: () => {
        this.loadTables();
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert('Failed to update status');
      }
    });
  }

  getStatusClass(status: TableStatus): string {
    switch (status) {
      case TableStatus.AVAILABLE:
        return 'status-available';
      case TableStatus.OCCUPIED:
        return 'status-occupied';
      case TableStatus.RESERVED:
        return 'status-reserved';
      case TableStatus.MAINTENANCE:
        return 'status-maintenance';
      default:
        return '';
    }
  }
}