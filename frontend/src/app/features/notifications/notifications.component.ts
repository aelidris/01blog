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
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatListModule, MatDividerModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container" style="max-width:600px">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Notifications</mat-card-title>
          <span class="spacer"></span>
          <button mat-button (click)="markAllRead()" *ngIf="notifications.length">Mark all read</button>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="loading" style="text-align:center;padding:24px">
            <mat-spinner [diameter]="32" style="margin:auto"></mat-spinner>
          </div>
          <div *ngIf="!loading && notifications.length === 0" style="text-align:center;color:#888;padding:24px">
            No notifications yet.
          </div>
          <mat-list>
            <mat-list-item *ngFor="let n of notifications"
              [style.background]="n.read ? '' : '#e8eaf6'"
              style="height:auto;padding:12px 0">
              <mat-icon matListItemIcon [color]="n.read ? '' : 'primary'">notifications</mat-icon>
              <div matListItemTitle>{{ n.message }}</div>
              <div matListItemLine style="color:#888;font-size:0.8em">{{ n.createdAt | date:'medium' }}</div>
              <a *ngIf="n.postId" [routerLink]="['/posts', n.postId]" mat-button matListItemMeta>View</a>
              <mat-divider></mat-divider>
            </mat-list-item>
          </mat-list>
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
}
