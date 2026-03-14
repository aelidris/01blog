import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
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
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <h2>Manage Users</h2>
      <mat-card *ngIf="loading" style="text-align:center;padding:32px">
        <mat-spinner [diameter]="40" style="margin:auto"></mat-spinner>
      </mat-card>
      <mat-card *ngIf="!loading">
        <table mat-table [dataSource]="users" style="width:100%">
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Username</th>
            <td mat-cell *matCellDef="let u">
              <a [routerLink]="['/block', u.username]">{{ u.username }}</a>
            </td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let u">{{ u.email }}</td>
          </ng-container>
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let u">
              <mat-chip [color]="u.role === 'ADMIN' ? 'warn' : 'primary'" highlighted>{{ u.role }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let u">
              <mat-chip [color]="u.banned ? 'warn' : 'primary'" highlighted>{{ u.banned ? 'BANNED' : 'ACTIVE' }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let u">
              <button mat-icon-button [color]="u.banned ? 'primary' : 'warn'" (click)="toggleBan(u)"
                [matTooltip]="u.banned ? 'Unban' : 'Ban'">
                <mat-icon>{{ u.banned ? 'lock_open' : 'lock' }}</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteUser(u)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
      </mat-card>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  cols = ['username', 'email', 'role', 'status', 'actions'];
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
