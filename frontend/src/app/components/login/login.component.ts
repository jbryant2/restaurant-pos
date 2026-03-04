import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSelectModule, MatTabsModule, MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  hidePassword = signal(true);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  registerForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['SERVER', Validators.required]
  });

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { username, password } = this.loginForm.value;
    this.auth.login({ username: username!, password: password! }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Invalid username or password');
        this.loading.set(false);
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { username, password, role } = this.registerForm.value;
    this.auth.register({ username: username!, password: password!, role: role! }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err.error || 'Registration failed');
        this.loading.set(false);
      }
    });
  }
}
