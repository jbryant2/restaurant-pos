import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatDividerModule, MatChipsModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private auth = inject(AuthService);
  role = signal(this.auth.getRole() ?? 'USER');

  navLinks = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/tables', icon: 'table_restaurant', label: 'Tables' },
    { path: '/menu', icon: 'menu_book', label: 'Menu' },
    { path: '/orders', icon: 'receipt_long', label: 'Orders' },
    { path: '/inventory', icon: 'inventory_2', label: 'Inventory' },
    { path: '/reports', icon: 'bar_chart', label: 'Reports' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
