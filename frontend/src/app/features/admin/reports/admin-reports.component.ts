import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../../core/services/admin.service';
import { Report } from '../../../core/models/report.model';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <!-- Updated max-width to 1200px to match all preceding admin components -->
    <div style="max-width: 1200px; margin: 24px auto; padding: 0 16px;">
      <h2 style="margin-bottom: 24px; font-weight: 600;">User Reports Dashboard</h2>

      <!-- Loading Spinner -->
      <div *ngIf="loading" style="text-align:center; padding:48px; border: 1px solid #e0e0e0; background: white; border-radius: 8px;">
        <mat-spinner [diameter]="40" style="margin:auto"></mat-spinner>
      </div>

      <!-- Reports List Container -->
      <div *ngIf="!loading" style="display: flex; flex-direction: column; gap: 16px;">
        
        <div *ngFor="let r of reports" style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 14px;">
          
          <!-- Top Row: Metadata (Reporter, Reported User, Date, Status) -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 16px; font-size: 0.9rem; color: #555;">
              <span><strong>Reporter:</strong> {{ r.reporter.username }}</span>
              <span>•</span>
              <span><strong>Reported User:</strong> <a [routerLink]="['/block', r.reportedUser?.username]" style="color: #3f51b5; text-decoration: none; font-weight: 500;">{{ r.reportedUser?.username }}</a></span>
              <span>•</span>
              <span style="color: #888;">{{ r.createdAt | date:'medium' }}</span>
            </div>

            <!-- Status Chip -->
            <mat-chip [color]="r.status === 'PENDING' ? 'warn' : r.status === 'RESOLVED' ? 'primary' : ''" highlighted style="font-size: 0.75rem; min-height: 24px;">
              {{ r.status }}
            </mat-chip>
          </div>

          <!-- Middle Section: The Reason Paragraph -->
          <div>
            <span style="font-size: 0.85rem; font-weight: 600; color: #777; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Reason:</span>
            <p style="margin: 0; font-size: 0.95rem; color: #333; line-height: 1.5; word-break: break-word; background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #eee;">
              {{ r.reason }}
            </p>
          </div>

          <!-- Bottom Row: Action Buttons -->
          <div *ngIf="r.status === 'PENDING'" style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px;">
            <button mat-stroked-button color="primary" (click)="resolve(r, 'resolve')" matTooltip="Mark Resolved" style="height: 32px; line-height: 30px;">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px; margin-right: 4px;">check</mat-icon> Resolve
            </button>
            <button mat-stroked-button color="warn" (click)="resolve(r, 'dismiss')" matTooltip="Dismiss" style="height: 32px; line-height: 30px;">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px; margin-right: 4px;">close</mat-icon> Dismiss
            </button>
          </div>

        </div>

        <!-- Empty State -->
        <div *ngIf="reports.length === 0" style="text-align:center; padding:48px; color:#888; background: white; border-radius: 8px; border: 1px solid #e0e0e0;">
          No reports found.
        </div>

      </div>
    </div>
  `
})
export class AdminReportsComponent implements OnInit {
  reports: Report[] = [];
  loading = true;

  constructor(private adminService: AdminService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.adminService.getReports().subscribe({ next: r => { this.reports = r; this.loading = false; } });
  }

  resolve(report: Report, action: string) {
    this.adminService.resolveReport(report.id, action).subscribe({
      next: (r) => { this.reports = this.reports.map(x => x.id === r.id ? r : x); this.snack.open('Updated', 'Close', { duration: 2000 }); },
      error: () => this.snack.open('Failed', 'Close', { duration: 2000 })
    });
  }
}