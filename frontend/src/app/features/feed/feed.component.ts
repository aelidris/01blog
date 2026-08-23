import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { PostCardComponent } from '../post/post-card/post-card.component';
import { ReportModalComponent } from '../../shared/components/report-modal/report-modal.component';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { Post } from '../../core/models/post.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent, MatProgressSpinnerModule,
            MatDialogModule, MatSnackBarModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <!-- Two-column modern feed layout -->
    <div style="max-width: 1200px; margin: 24px auto; display: flex; gap: 24px; padding: 0 16px;">
      
      <!-- Main Feed Column -->
      <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 20px;">

        <div *ngIf="loading" style="text-align:center;padding:40px">
          <mat-spinner [diameter]="40" style="margin:auto"></mat-spinner>
        </div>

        <!-- Empty feed CTA -->
        <div *ngIf="!loading && posts.length === 0"
             style="text-align:center;padding:60px 24px;background:white;border-radius:8px;border:1px solid #e0e0e0;box-shadow:0 1px 3px rgba(0,0,0,.02)">
          <mat-icon style="font-size:64px;width:64px;height:64px;color:#bdbdbd;margin-bottom:16px">dynamic_feed</mat-icon>
          <h2 style="margin:0 0 8px;color:#444">Your feed is empty</h2>
          <p style="color:#888;margin:0 0 24px">
            Subscribe to other users to see their posts here.
          </p>
          <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
            <a mat-raised-button color="primary" routerLink="/explore">
              <mat-icon>explore</mat-icon> Find Users to Follow
            </a>
            <a mat-stroked-button routerLink="/posts/new">
              <mat-icon>add</mat-icon> Create Your First Post
            </a>
          </div>
        </div>

        <!-- Feed List Container -->
        <app-post-card
          *ngFor="let post of posts"
          [post]="post"
          (likeToggle)="toggleLike($event)"
          (deletePost)="deletePost($event)"
          (reportUser)="openReport($event)">
        </app-post-card>

        <div style="text-align:center;margin:16px" *ngIf="!loading && !lastPage && posts.length > 0">
          <button mat-stroked-button (click)="loadMore()" style="width: 100%; background: white;">Load More</button>
        </div>

      </div>

      <!-- Sidebar Column (Fills the side space cleanly) -->
      <aside style="width: 300px; flex-shrink: 0; display: none; @media(min-width: 850px){display: block;}">
        <mat-card style="padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <h3 style="margin-top: 0; font-size: 1.1rem; color: #333;">Welcome back!</h3>
          <p style="font-size: 0.9rem; color: #666; line-height: 1.4; margin-bottom: 20px;">
            Share your latest updates, discover fellow developers, and explore new posts.
          </p>
          <a mat-flat-button color="primary" routerLink="/posts/new" style="width: 100%; box-sizing: border-box; text-align: center;">
            <mat-icon style="margin-right: 4px;">add</mat-icon> Create Post
          </a>
        </mat-card>
      </aside>

    </div>
  `
})
export class FeedComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  loading = false;
  page = 0;
  lastPage = false;

  constructor(
    private postService: PostService, 
    private dialog: MatDialog, 
    private snack: MatSnackBar, 
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit() { 
    this.loadPosts(); 

    const savedPosition = sessionStorage.getItem('feed_scroll_pos');
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo(0, Number(savedPosition));
      }, 150);
    }
  }

  ngOnDestroy() {
    sessionStorage.setItem('feed_scroll_pos', window.pageYOffset.toString());
  }

  loadPosts() {
    this.loading = true;
    this.postService.getFeed(this.page).subscribe({
      next: (p) => { this.posts = [...this.posts, ...p.content]; this.lastPage = p.last; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadMore() { this.page++; this.loadPosts(); }

  toggleLike(postId: number) {
    this.postService.toggleLike(postId).subscribe({
      next: (updated) => {
        this.posts = this.posts.map(p => p.id === postId ? updated : p);
      },
      error: (err) => {
        if (err.status === 404) {
          this.posts = this.posts.filter(p => p.id !== postId);
          this.router.navigate(['/feed']);
        } else {
          console.error('Failed to toggle like', err);
        }
      }
    });
  }

  deletePost(postId: number) {
    if (!confirm('Delete this post?')) return;
    this.postService.deletePost(postId).subscribe({
      next: () => { this.posts = this.posts.filter(p => p.id !== postId); this.snack.open('Post deleted', 'Close', { duration: 2000 }); },
      error: () => this.snack.open('Delete failed', 'Close', { duration: 2000 })
    });
  }

  openReport(userId: number) {
    this.dialog.open(ReportModalComponent, { data: { userId }, width: '450px' });
  }
}
