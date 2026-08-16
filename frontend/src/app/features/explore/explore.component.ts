import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatProgressSpinnerModule,
    MatDividerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <h2 style="margin-bottom:8px">Explore Users</h2>
      <p style="color:#888;margin-top:0;margin-bottom:24px">Find people to follow and fill your feed with their posts.</p>

      <!-- Search bar -->
      <mat-form-field appearance="outline" style="width:100%;margin-bottom:24px">
        <mat-label>Search by username or bio...</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [formControl]="searchCtrl" autocomplete="off">
        <button *ngIf="searchCtrl.value" matSuffix mat-icon-button (click)="searchCtrl.setValue('')">
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>

      <!-- Loading -->
      <div *ngIf="loading" style="text-align:center;padding:40px">
        <mat-spinner [diameter]="40" style="margin:auto"></mat-spinner>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && users.length === 0" style="text-align:center;padding:40px;color:#888">
        <mat-icon style="font-size:48px;width:48px;height:48px;opacity:.4">person_search</mat-icon>
        <p>{{ searchCtrl.value ? 'No users found for "' + searchCtrl.value + '"' : 'No other users yet.' }}</p>
      </div>

      <!-- User cards grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
        <mat-card *ngFor="let user of users" style="display:flex;flex-direction:column">
          <mat-card-content style="flex:1;padding:20px">
            <div style="display:flex;align-items:center;gap:14px">
              <!-- Avatar -->
              <a [routerLink]="['/block', user.username]"
                 style="flex-shrink:0;width:52px;height:52px;border-radius:50%;background:#3f51b5;display:flex;align-items:center;justify-content:center;color:white;font-size:1.4rem;font-weight:bold;text-decoration:none;overflow:hidden">

                <!-- Show image if avatarUrl exists -->
                <img *ngIf="user.avatarUrl" 
                     [src]="'http://localhost:8080' + user.avatarUrl" 
                     alt="{{ user.username }}"
                     style="width:100%;height:100%;object-fit:cover">

                <!-- Fallback to first letter if avatarUrl is missing -->
                <span *ngIf="!user.avatarUrl">
                  {{ user.username[0].toUpperCase() }}
                </span>
              </a>

              
              <div style="flex:1;min-width:0">
                <a [routerLink]="['/block', user.username]"
                   style="font-weight:600;font-size:1rem;color:#3f51b5;text-decoration:none;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  {{ user.username }}
                </a>
                <p style="margin:2px 0 4px;color:#888;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  {{ user.bio || 'No bio yet' }}
                </p>
                <span style="font-size:.8rem;color:#aaa">
                  <mat-icon style="font-size:14px;vertical-align:middle;width:14px;height:14px">people</mat-icon>
                  {{ user.subscriberCount }} subscriber{{ user.subscriberCount !== 1 ? 's' : '' }}
                </span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions style="padding:8px 16px 12px">
            <button mat-raised-button
              [color]="user.subscribedByCurrentUser ? '' : 'primary'"
              style="width:100%"
              [disabled]="isOwnProfile(user)"
              (click)="toggleSubscribe(user)">
              <mat-icon>{{ user.subscribedByCurrentUser ? 'person_remove' : 'person_add' }}</mat-icon>
              {{ isOwnProfile(user) ? 'You' : (user.subscribedByCurrentUser ? 'Unsubscribe' : 'Subscribe') }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `
})
export class ExploreComponent implements OnInit {
  users: User[] = [];
  loading = true;
  searchCtrl = new FormControl('');

  constructor(
    private userService: UserService,
    public auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAll();

    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(q => {
        this.loading = true;
        return q && q.trim().length > 0
          ? this.userService.searchUsers(q.trim())
          : this.userService.browseUsers();
      })
    ).subscribe({
      next: users => { this.users = users; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadAll() {
    this.loading = true;
    this.userService.browseUsers().subscribe({
      next: users => { this.users = users; this.loading = false; },
      error: () => this.loading = false
    });
  }

  isOwnProfile(user: User) {
    return this.auth.currentUser()?.id === user.id;
  }

  toggleSubscribe(user: User) {
    const action = user.subscribedByCurrentUser
      ? this.userService.unsubscribe(user.id)
      : this.userService.subscribe(user.id);

    action.subscribe({
      next: () => {
        user.subscribedByCurrentUser = !user.subscribedByCurrentUser;
        user.subscriberCount += user.subscribedByCurrentUser ? 1 : -1;
        this.snack.open(
          user.subscribedByCurrentUser ? `Subscribed to ${user.username}` : `Unsubscribed from ${user.username}`,
          'Close', { duration: 2000 }
        );
      },
      error: () => this.snack.open('Action failed', 'Close', { duration: 2000 })
    });
  }
}
