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
    <!-- Constrained to 1200px max-width, centered with padding -->
    <div style="max-width: 1200px; margin: 24px auto; padding: 0 16px;">
      <h2 style="margin-bottom: 24px;">Admin Dashboard</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px">
        <mat-card class="admin-card" style="border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <mat-card-content style="text-align:center;padding:32px">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#3f51b5">people</mat-icon>
            <h3 style="margin: 16px 0;">Users</h3>
            <a mat-raised-button color="primary" routerLink="/admin/users" style="width: 100%;">Manage Users</a>
          </mat-card-content>
        </mat-card>
        <mat-card class="admin-card" style="border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <mat-card-content style="text-align:center;padding:32px">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#e91e63">article</mat-icon>
            <h3 style="margin: 16px 0;">Posts</h3>
            <a mat-raised-button color="accent" routerLink="/admin/posts" style="width: 100%;">Manage Posts</a>
          </mat-card-content>
        </mat-card>
        <mat-card class="admin-card" style="border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <mat-card-content style="text-align:center;padding:32px">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#f44336">flag</mat-icon>
            <h3 style="margin: 16px 0;">Reports</h3>
            <a mat-raised-button color="warn" routerLink="/admin/reports" style="width: 100%;">View Reports</a>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class DashboardComponent {}
