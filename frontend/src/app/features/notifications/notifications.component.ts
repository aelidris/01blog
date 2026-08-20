import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../core/services/user.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container" style="max-width:650px">
      <mat-card>
        <mat-card-header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <mat-card-title>Notifications</mat-card-title>
          <button mat-button color="primary" (click)="markAllRead()" *ngIf="notifications.length">Mark all read</button>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="loading" style="text-align:center;padding:24px">
            <mat-spinner [diameter]="32" style="margin:auto"></mat-spinner>
          </div>
          <div *ngIf="!loading && notifications.length === 0" style="text-align:center;color:#888;padding:24px">
            No notifications yet.
          </div>

          <!-- Modern Flex Notification List -->
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div *ngFor="let n of notifications" 
                 [style.background]="n.read ? '#fff' : '#e8eaf6'"
                 style="display:flex; align-items:flex-start; justify-content:space-between; padding:16px; border-radius:8px; border:1px solid #e0e0e0; gap:16px; transition: background 0.2s;">
              
              <!-- Left side: Icon & Message details -->
              <div style="display:flex; align-items:flex-start; gap:12px; flex-grow:1;">
                <mat-icon [color]="n.read ? '' : 'primary'" style="margin-top:2px;">notifications</mat-icon>
                <div style="display:flex; flex-direction:column; gap:4px;">
                  <span style="font-size:0.95rem; color:#333; font-weight:500;">{{ n.message }}</span>
                  <span style="font-size:0.75rem; color:#777;">{{ n.createdAt | date:'medium' }}</span>
                </div>
              </div>

              <!-- Right side: Actions (View & Toggle Read) -->
              <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                <a *ngIf="n.postId" [routerLink]="['/posts', n.postId]" mat-stroked-button color="primary" style="min-width:auto; padding:0 12px; height:32px; line-height:30px; font-size:0.85rem;">
                  View
                </a>
                <button mat-button style="font-size:0.75rem; padding:0 8px; height:32px; color:#555;" (click)="toggleRead(n)">
                  {{ n.read ? 'Mark Unread' : 'Mark Read' }}
                </button>
              </div>

            </div>
          </div>

        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getNotifications().subscribe({
      next: (n) => { this.notifications = n; this.loading = false; },
      error: () => this.loading = false
    });
  }

  markAllRead() {
    this.userService.markAllRead().subscribe(() => {
      this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    });
  }

  toggleRead(n: Notification) {
    const newReadState = !n.read;
    // Call your service method to update the single notification state on backend
    this.userService.updateNotificationReadStatus(n.id, newReadState).subscribe({
      next: () => {
        n.read = newReadState;
      },
      error: (err) => console.error('Failed to update notification status', err)
    });
  }
}
