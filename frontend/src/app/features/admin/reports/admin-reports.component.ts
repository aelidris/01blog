import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
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
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <h2>User Reports</h2>
      <mat-card *ngIf="loading" style="text-align:center;padding:32px">
        <mat-spinner [diameter]="40" style="margin:auto"></mat-spinner>
      </mat-card>
      <mat-card *ngIf="!loading">
        <table mat-table [dataSource]="reports" style="width:100%">
          <ng-container matColumnDef="reporter">
            <th mat-header-cell *matHeaderCellDef>Reporter</th>
            <td mat-cell *matCellDef="let r">{{ r.reporter.username }}</td>
          </ng-container>
          <ng-container matColumnDef="reported">
            <th mat-header-cell *matHeaderCellDef>Reported User</th>
            <td mat-cell *matCellDef="let r">
              <a [routerLink]="['/block', r.reportedUser?.username]">{{ r.reportedUser?.username }}</a>
            </td>
          </ng-container>
          <ng-container matColumnDef="reason">
            <th mat-header-cell *matHeaderCellDef>Reason</th>
            <td mat-cell *matCellDef="let r" style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              {{ r.reason }}
            </td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let r">{{ r.createdAt | date:'short' }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let r">
              <mat-chip [color]="r.status === 'PENDING' ? 'warn' : r.status === 'RESOLVED' ? 'primary' : ''" highlighted>
                {{ r.status }}
              </mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let r">
              <ng-container *ngIf="r.status === 'PENDING'">
                <button mat-button color="primary" (click)="resolve(r, 'resolve')" matTooltip="Mark Resolved">
                  <mat-icon>check</mat-icon> Resolve
                </button>
                <button mat-button color="warn" (click)="resolve(r, 'dismiss')" matTooltip="Dismiss">
                  <mat-icon>close</mat-icon> Dismiss
                </button>
              </ng-container>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        <div *ngIf="reports.length === 0" style="text-align:center;padding:32px;color:#888">No reports found.</div>
      </mat-card>
    </div>
  `
})
export class AdminReportsComponent implements OnInit {
  reports: Report[] = [];
  cols = ['reporter', 'reported', 'reason', 'date', 'status', 'actions'];
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
