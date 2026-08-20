import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <!-- Constrained to 1200px max-width, centered with padding -->
    <div style="max-width: 1200px; margin: 24px auto; padding: 0 16px;">
      
      <h2 style="margin-bottom: 24px; font-weight: 600;">Manage Users</h2>
      
      <!-- Loading Spinner -->
      <div *ngIf="loading" style="text-align:center; padding:48px; border: 1px solid #e0e0e0; background: white; border-radius: 8px;">
        <mat-spinner [diameter]="40" style="margin:auto"></mat-spinner>
      </div>

      <!-- Users List Container -->
      <div *ngIf="!loading" style="display: flex; flex-direction: column; gap: 16px;">
        
        <div *ngFor="let u of users" style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 14px;">
          
          <!-- Top Row: User Metadata & Status Chips -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 16px; font-size: 0.95rem; color: #555; flex-wrap: wrap;">
              <span><strong>Username:</strong> <a [routerLink]="['/block', u.username]" style="color: #3f51b5; text-decoration: none; font-weight: 500;">{{ u.username }}</a></span>
              <span>•</span>
              <span><strong>Email:</strong> {{ u.email }}</span>
            </div>

            <!-- Chips Group (Role & Status) -->
            <div style="display: flex; gap: 8px; align-items: center;">
              <mat-chip [color]="u.role === 'ADMIN' ? 'warn' : 'primary'" highlighted style="font-size: 0.75rem; min-height: 24px;">
                {{ u.role }}
              </mat-chip>
              <mat-chip [color]="u.banned ? 'warn' : 'primary'" highlighted style="font-size: 0.75rem; min-height: 24px;">
                {{ u.banned ? 'BANNED' : 'ACTIVE' }}
              </mat-chip>
            </div>
          </div>

          <!-- Bottom Row / Actions Area -->
          <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; padding-top: 4px;">
            <ng-container *ngIf="u.role !== 'ADMIN'">
              <button mat-stroked-button [color]="u.banned ? 'primary' : 'warn'" (click)="toggleBan(u)"
                [matTooltip]="u.banned ? 'Unban User' : 'Ban User'" style="height: 32px; line-height: 30px;">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px; margin-right: 4px;">{{ u.banned ? 'lock_open' : 'lock' }}</mat-icon> 
                {{ u.banned ? 'Unban' : 'Ban' }}
              </button>
              <button mat-stroked-button color="warn" (click)="deleteUser(u)" matTooltip="Delete User" style="height: 32px; line-height: 30px;">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px; margin-right: 4px;">delete</mat-icon> Delete
              </button>
            </ng-container>
            <span *ngIf="u.role === 'ADMIN'" style="font-size: 0.85rem; color: #888; font-style: italic;">Protected Admin Account</span>
          </div>

        </div>

        <!-- Empty State -->
        <div *ngIf="users.length === 0" style="text-align:center; padding:48px; color:#888; background: white; border-radius: 8px; border: 1px solid #e0e0e0;">
          No users found.
        </div>

      </div>

    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;

  constructor(private adminService: AdminService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.adminService.getUsers().subscribe({ next: u => { this.users = u; this.loading = false; } });
  }

  toggleBan(user: User) {
    const action = user.banned ? this.adminService.unbanUser(user.id) : this.adminService.banUser(user.id);
    action.subscribe({
      next: (u) => { this.users = this.users.map(x => x.id === u.id ? u : x); this.snack.open('Updated', 'Close', { duration: 2000 }); },
      error: () => this.snack.open('Failed', 'Close', { duration: 2000 })
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Delete user "${user.username}"? This is irreversible.`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => { this.users = this.users.filter(u => u.id !== user.id); this.snack.open('Deleted', 'Close', { duration: 2000 }); },
      error: () => this.snack.open('Failed', 'Close', { duration: 2000 })
    });
  }
}