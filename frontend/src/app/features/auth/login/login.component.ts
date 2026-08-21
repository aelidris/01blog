import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page-container" style="max-width:420px">
      <mat-card>
        <mat-card-header><mat-card-title>Login to 01Blog</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" style="display:flex;flex-direction:column;gap:12px;margin-top:16px">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password">
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions style="padding:16px">
          <span>No account? <a routerLink="/register">Register</a></span>
        </mat-card-actions>
      </mat-card>
    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  loading = false;

  constructor(fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {
    this.form = fb.group({ username: ['', Validators.required], password: ['', Validators.required] });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/feed']),
      error: (e) => {
        const errorMessage = typeof e.error === 'string' ? e.error : (e.error?.error || 'Invalid username or password');
        this.snack.open(errorMessage, 'Close', { duration: 4000 });
        this.loading = false;
      }
    });
  }
}
