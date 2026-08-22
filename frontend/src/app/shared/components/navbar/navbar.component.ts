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
    <mat-toolbar color="primary" style="box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 0 24px; position: sticky; top: 0; z-index: 1000;">
      <a routerLink="/feed" style="color:white; font-weight:700; font-size:1.25rem; text-decoration:none; display: flex; align-items: center; gap: 8px;">
        <mat-icon style="font-size: 24px; width: 24px; height: 24px;">rss_feed</mat-icon> 01Blog
      </a>
      <span style="flex-grow: 1;"></span>

      <ng-container *ngIf="auth.isLoggedIn(); else guestNav">

        <div style="display: flex; align-items: center; gap: 4px;">
          <!-- Feed button that hides on mobile screens under 450px -->
          <a mat-button routerLink="/feed" routerLinkActive="active-nav" matTooltip="Feed" style="border-radius: 4px;" class="hide-on-mobile">
            <mat-icon>home</mat-icon>
            <span class="nav-label">Feed</span>
          </a>

          <!-- Explore button that stays visible on all screens -->
          <a mat-button routerLink="/explore" routerLinkActive="active-nav" matTooltip="Find users to follow" style="border-radius: 4px;">
            <mat-icon>explore</mat-icon>
            <span class="nav-label">Explore</span>
          </a>

          <a mat-button routerLink="/posts/new" routerLinkActive="active-nav" matTooltip="New post" style="border-radius: 4px;">
            <mat-icon>add_circle_outline</mat-icon>
            <span class="nav-label">Post</span>
          </a>

          <a mat-button routerLink="/notifications" routerLinkActive="active-nav" matTooltip="Notifications" style="border-radius: 4px; min-width: 40px; padding: 0 8px;">
            <mat-icon
              [matBadge]="unread() > 0 ? unread() : null"
              matBadgeColor="warn"
              matBadgeSize="small">
              notifications
            </mat-icon>
          </a>
        </div>

        <div style="width: 1px; height: 24px; background: rgba(255,255,255,0.2); margin: 0 12px;"></div>

        <button mat-button [matMenuTriggerFor]="userMenu" style="padding: 4px 8px; border-radius: 4px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,.25); display:flex; align-items:center; justify-content:center; font-weight:bold; overflow:hidden; border: 1px solid rgba(255,255,255,0.4);">
              
              <!-- Show image if avatarUrl exists -->
              <img *ngIf="auth.currentUser()?.avatarUrl" 
                   [src]="'http://localhost:8080' + auth.currentUser()?.avatarUrl" 
                   alt="Avatar"
                   style="width:100%;height:100%;object-fit:cover">
            
              <!-- Fallback to first letter -->
              <span *ngIf="!auth.currentUser()?.avatarUrl" style="font-size: 0.9rem;">
                {{ auth.currentUser()?.username?.[0]?.toUpperCase() }}
              </span>
            
            </div>
            <span class="nav-label" style="font-weight: 500;">{{ auth.currentUser()?.username }}</span>
            <mat-icon style="font-size: 18px; width: 18px; height: 18px; margin-left: -4px;">arrow_drop_down</mat-icon>
          </div>
        </button>

        <mat-menu #userMenu="matMenu" xPosition="after" style="margin-top: 8px;">
          <a mat-menu-item [routerLink]="['/block', auth.currentUser()?.username]">
            <mat-icon color="primary">person</mat-icon> My Profile & Block
          </a>
          <a mat-menu-item routerLink="/profile/edit">
            <mat-icon>edit</mat-icon> Edit Profile
          </a>
          <a mat-menu-item routerLink="/explore">
            <mat-icon>explore</mat-icon> Explore Users
          </a>
          <mat-divider *ngIf="auth.isAdmin()"></mat-divider>
          <a mat-menu-item routerLink="/admin/dashboard" *ngIf="auth.isAdmin()">
            <mat-icon color="warn">admin_panel_settings</mat-icon> Admin Panel
          </a>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon style="color: #d32f2f;">logout</mat-icon> Logout
          </button>
        </mat-menu>

      </ng-container>

      <ng-template #guestNav>
        <div style="display: flex; gap: 8px;">
          <a mat-button routerLink="/login" style="font-weight: 500;">Login</a>
          <a mat-raised-button color="accent" routerLink="/register" style="font-weight: 500;">Register</a>
        </div>
      </ng-template>
    </mat-toolbar>

    <style>
      .active-nav { background: rgba(255,255,255,.18) !important; }
      .nav-label { margin-left: 4px; }

      @media (max-width: 768px) { 
        .nav-label { display: none; } 
      }

      /* Fix for mobile screens under 450px */
      @media (max-width: 450px) {
        mat-toolbar {
          padding: 0 4px !important;
        }
        mat-toolbar div {
          gap: 0px !important;
        }

        .hide-on-mobile {
          display: none !important;
        }
        mat-toolbar a[routerLink="/feed"] {
          font-size: 1rem !important;
          gap: 2px !important;
        }
      }
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
