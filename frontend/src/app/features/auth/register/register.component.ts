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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page-container" style="max-width:420px; margin: 24px auto; padding: 0 16px;">
      <mat-card style="border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <mat-card-header style="padding: 20px 24px 0;"><mat-card-title style="font-size: 1.25rem; font-weight: 600;">Create Account</mat-card-title></mat-card-header>
        <mat-card-content style="padding: 24px;">
          <form [formGroup]="form" (ngSubmit)="submit()" style="display:flex;flex-direction:column;gap:16px;">
            
            <mat-form-field appearance="outline" style="width: 100%;">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username">
              <mat-error *ngIf="form.get('username')?.hasError('required')">Username is required</mat-error>
              <mat-error *ngIf="form.get('username')?.hasError('minlength')">Must be at least 3 characters</mat-error>
              <mat-error *ngIf="form.get('username')?.hasError('pattern')">Only letters, numbers, and underscores allowed</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" style="width: 100%;">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
              <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('pattern') || form.get('email')?.hasError('email')">Enter a valid email like name&#64;example.com</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 12px;">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password">
              <mat-error *ngIf="form.get('password')?.hasError('required')">Password is required</mat-error>
              <mat-error *ngIf="form.get('password')?.hasError('minlength')">Must be at least 8 characters</mat-error>
              <mat-error *ngIf="form.get('password')?.hasError('pattern')">Must include uppercase, lowercase, and a number</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" style="width: 100%;">
              <mat-label>Bio (optional)</mat-label>
              <textarea matInput formControlName="bio" rows="2"></textarea>
              <mat-error *ngIf="form.get('bio')?.hasError('maxlength')">Max 200 characters</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading" style="height: 36px;">
              {{ loading ? 'Registering...' : 'Register' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions style="padding: 16px 24px; border-top: 1px solid #f0f0f0;">
          <span style="font-size: 0.9rem; color: #666;">Already have an account? <a routerLink="/login" style="color: #3f51b5; text-decoration: none;">Login</a></span>
        </mat-card-actions>
      </mat-card>
    </div>
  `
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;

  constructor(fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {
    this.form = fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.maxLength(100),
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/)
      ]],
      bio: ['', [Validators.maxLength(200)]]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/feed']),
      error: (e) => { this.snack.open(e.error?.error || 'Registration failed', 'Close', { duration: 3000 }); this.loading = false; }
    });
  }
}