import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatGridListModule],
  template: `
    <div class="page-container">
      <h2>Admin Dashboard</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
        <mat-card class="admin-card">
          <mat-card-content style="text-align:center;padding:32px">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#3f51b5">people</mat-icon>
            <h3>Users</h3>
            <a mat-raised-button color="primary" routerLink="/admin/users">Manage Users</a>
          </mat-card-content>
        </mat-card>
        <mat-card class="admin-card">
          <mat-card-content style="text-align:center;padding:32px">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#e91e63">article</mat-icon>
            <h3>Posts</h3>
            <a mat-raised-button color="accent" routerLink="/admin/posts">Manage Posts</a>
          </mat-card-content>
        </mat-card>
        <mat-card class="admin-card">
          <mat-card-content style="text-align:center;padding:32px">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#f44336">flag</mat-icon>
            <h3>Reports</h3>
            <a mat-raised-button color="warn" routerLink="/admin/reports">View Reports</a>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class DashboardComponent {}
