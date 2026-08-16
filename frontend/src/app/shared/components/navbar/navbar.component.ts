import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule,
            MatIconModule, MatBadgeModule, MatMenuModule, MatTooltipModule, MatDividerModule],
  template: `
    <mat-toolbar color="primary">
      <a routerLink="/feed" style="color:white;font-weight:bold;font-size:1.2rem;text-decoration:none">01Blog</a>
      <span class="spacer"></span>

      <ng-container *ngIf="auth.isLoggedIn(); else guestNav">

        <a mat-button routerLink="/feed" routerLinkActive="active-nav" matTooltip="Feed">
          <mat-icon>home</mat-icon>
          <span class="nav-label">Feed</span>
        </a>

        <a mat-button routerLink="/explore" routerLinkActive="active-nav" matTooltip="Find users to follow">
          <mat-icon>explore</mat-icon>
          <span class="nav-label">Explore</span>
        </a>

        <a mat-button routerLink="/posts/new" routerLinkActive="active-nav" matTooltip="New post">
          <mat-icon>add_circle_outline</mat-icon>
          <span class="nav-label">Post</span>
        </a>

        <a mat-button routerLink="/notifications" routerLinkActive="active-nav" matTooltip="Notifications">
          <mat-icon
            [matBadge]="unread() > 0 ? unread() : null"
            matBadgeColor="warn"
            matBadgeSize="small">
            notifications
          </mat-icon>
        </a>

        <button mat-button [matMenuTriggerFor]="userMenu" style="margin-left:4px">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.25);display:inline-flex;align-items:center;justify-content:center;font-weight:bold;margin-right:6px;overflow:hidden">
            
            <!-- Show image if avatarUrl exists -->
            <img *ngIf="auth.currentUser()?.avatarUrl" 
                 [src]="'http://localhost:8080' + auth.currentUser()?.avatarUrl" 
                 alt="Avatar"
                 style="width:100%;height:100%;object-fit:cover">
          
            <!-- Fallback to first letter -->
            <span *ngIf="!auth.currentUser()?.avatarUrl">
              {{ auth.currentUser()?.username?.[0]?.toUpperCase() }}
            </span>
          
          </div>
          <span class="nav-label">{{ auth.currentUser()?.username }}</span>
        </button>

        <mat-menu #userMenu="matMenu">
          <a mat-menu-item [routerLink]="['/block', auth.currentUser()?.username]">
            <mat-icon>person</mat-icon> My Block
          </a>
          <a mat-menu-item routerLink="/profile/edit">
            <mat-icon>edit</mat-icon> Edit Profile
          </a>
          <a mat-menu-item routerLink="/explore">
            <mat-icon>explore</mat-icon> Explore Users
          </a>
          <mat-divider></mat-divider>
          <a mat-menu-item routerLink="/admin/dashboard" *ngIf="auth.isAdmin()">
            <mat-icon>admin_panel_settings</mat-icon> Admin Panel
          </a>
          <mat-divider *ngIf="auth.isAdmin()"></mat-divider>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </mat-menu>

      </ng-container>

      <ng-template #guestNav>
        <a mat-button routerLink="/login">Login</a>
        <a mat-raised-button routerLink="/register" style="margin-left:8px">Register</a>
      </ng-template>
    </mat-toolbar>

    <style>
      .active-nav { background: rgba(255,255,255,.15) !important; border-radius: 4px; }
      .nav-label { margin-left: 4px; }
      @media (max-width: 600px) { .nav-label { display: none; } }
    </style>
  `
})
export class NavbarComponent implements OnInit {
  unread = signal(0);

  constructor(public auth: AuthService, private userService: UserService) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.userService.getUnreadCount().subscribe(r => this.unread.set(r.count));
    }
  }
}
