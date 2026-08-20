import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { PostCardComponent } from '../../post/post-card/post-card.component';
import { ReportModalComponent } from '../../../shared/components/report-modal/report-modal.component';
import { User } from '../../../core/models/user.model';
import { Post } from '../../../core/models/post.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-block',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatProgressSpinnerModule, PostCardComponent],
  template: `
    <!-- Consistent max-width container for profile view -->
    <div style="max-width: 1200px; margin: 24px auto; padding: 0 16px;" *ngIf="user">
      
      <mat-card style="margin-bottom:24px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); border-radius: 8px;">
        <mat-card-content style="display:flex; align-items:center; gap:24px; padding:24px; flex-wrap: wrap;">
          
          <div style="width:80px;height:80px;border-radius:50%;background:#3f51b5;display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;font-weight:bold;flex-shrink:0;overflow:hidden">
            <!-- Show image if user avatarUrl exists -->
            <img *ngIf="user.avatarUrl" 
                 [src]="'http://localhost:8080' + user.avatarUrl" 
                 alt="{{ user.username }}"
                 style="width:100%;height:100%;object-fit:cover">

            <!-- Fallback to first letter if no avatarUrl -->
            <span *ngIf="!user.avatarUrl">
              {{ user.username[0].toUpperCase() }}
            </span>
          </div>

          <div style="flex:1; min-width: 200px;">
            <h2 style="margin:0">{{ user.username }}</h2>
            <p style="color:#888;margin:4px 0">{{ user.bio || 'No bio yet' }}</p>
            <div style="display:flex;gap:16px;margin-top:8px">
              <span><strong>{{ user.subscriberCount }}</strong> subscribers</span>
              <span><strong>{{ user.subscriptionCount }}</strong> subscriptions</span>
            </div>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <div *ngIf="!isOwnProfile()">
              <button mat-raised-button [color]="user.subscribedByCurrentUser ? '' : 'primary'"
                (click)="toggleSubscribe()">
                <mat-icon>{{ user.subscribedByCurrentUser ? 'person_remove' : 'person_add' }}</mat-icon>
                {{ user.subscribedByCurrentUser ? 'Unsubscribe' : 'Subscribe' }}
              </button>
              <button mat-icon-button (click)="openReport()" *ngIf="auth.isLoggedIn()" style="margin-left: 4px;">
                <mat-icon>flag</mat-icon>
              </button>
            </div>
            <div *ngIf="isOwnProfile()">
              <a mat-stroked-button routerLink="/profile/edit">
                <mat-icon>edit</mat-icon> Edit Profile
              </a>
            </div>
          </div>

        </mat-card-content>
      </mat-card>

      <h3 style="margin-bottom: 16px; color: #444;">Posts</h3>
      
      <div *ngIf="loadingPosts" style="text-align:center;padding:24px">
        <mat-spinner [diameter]="40" style="margin:auto"></mat-spinner>
      </div>
      
      <div *ngIf="!loadingPosts && posts.length === 0" style="color:#888;text-align:center;padding:24px; background: white; border-radius: 8px; border: 1px solid #e0e0e0;">
        No posts yet.
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <app-post-card
          *ngFor="let post of posts"
          [post]="post"
          (likeToggle)="toggleLike($event)"
          (deletePost)="deletePost($event)"
          (reportUser)="openReport()">
        </app-post-card>
      </div>

      <div style="text-align:center;margin:24px 0" *ngIf="!lastPage">
        <button mat-stroked-button (click)="loadMorePosts()" style="width: 100%; background: white;">Load More</button>
      </div>

    </div>

    <div *ngIf="!user && loading" style="text-align:center;padding:40px">
      <mat-spinner [diameter]="40" style="margin:auto"></mat-spinner>
    </div>
  `
})
export class BlockComponent implements OnInit {
  user: User | null = null;
  posts: Post[] = [];
  loading = true;
  loadingPosts = false;
  page = 0;
  lastPage = false;

  constructor(
    private route: ActivatedRoute, private userService: UserService,
    private postService: PostService, public auth: AuthService,
    private dialog: MatDialog, private snack: MatSnackBar, private router: Router
  ) {}

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username')!;
    this.userService.getBlock(username).subscribe({ next: u => { this.user = u; this.loading = false; this.loadPosts(); } });
  }

  loadPosts() {
    if (!this.user) return;
    this.loadingPosts = true;
    this.postService.getUserPosts(this.user.id, this.page).subscribe({
      next: p => { this.posts = [...this.posts, ...p.content]; this.lastPage = p.last; this.loadingPosts = false; }
    });
  }

  loadMorePosts() { this.page++; this.loadPosts(); }

  isOwnProfile() { return this.auth.currentUser()?.username === this.user?.username; }

  toggleSubscribe() {
    if (!this.user) return;
    const action = this.user.subscribedByCurrentUser
      ? this.userService.unsubscribe(this.user.id)
      : this.userService.subscribe(this.user.id);
    action.subscribe(() => {
      this.user!.subscribedByCurrentUser = !this.user!.subscribedByCurrentUser;
      this.user!.subscriberCount += this.user!.subscribedByCurrentUser ? 1 : -1;
    });
  }

  toggleLike(postId: number) {
    this.postService.toggleLike(postId).subscribe({
      next: (updated) => {
        this.posts = this.posts.map(p => p.id === postId ? updated : p);
      },
      error: (err) => {
        if (err.status == 404 || (err.error && err.error.error === 'Post not found')) {
          // Remove the deleted post from the local list instantly, staying on the same page
          this.posts = this.posts.filter(p => p.id !== postId);
        } else {
          console.error('Failed to toggle like', err);
        }
      }
    });
  }

  deletePost(postId: number) {
    if (!confirm('Delete this post?')) return;
    this.postService.deletePost(postId).subscribe({
      next: () => { this.posts = this.posts.filter(p => p.id !== postId); this.snack.open('Deleted', 'Close', {duration: 2000}); }
    });
  }

  openReport() {
    if (!this.user) return;
    this.dialog.open(ReportModalComponent, { data: { userId: this.user.id }, width: '450px' });
  }
}
