import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PostCardComponent } from '../post/post-card/post-card.component';
import { ReportModalComponent } from '../../shared/components/report-modal/report-modal.component';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/models/post.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent, MatProgressSpinnerModule,
            MatDialogModule, MatSnackBarModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">

      <div *ngIf="loading" style="text-align:center;padding:40px">
        <mat-spinner [diameter]="40" style="margin:auto"></mat-spinner>
      </div>

      <!-- Empty feed CTA -->
      <div *ngIf="!loading && posts.length === 0"
           style="text-align:center;padding:60px 24px;background:white;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.12)">
        <mat-icon style="font-size:64px;width:64px;height:64px;color:#bdbdbd;margin-bottom:16px">dynamic_feed</mat-icon>
        <h2 style="margin:0 0 8px;color:#444">Your feed is empty</h2>
        <p style="color:#888;margin:0 0 24px">
          Subscribe to other users to see their posts here.
        </p>
        <a mat-raised-button color="primary" routerLink="/explore" style="margin-right:12px">
          <mat-icon>explore</mat-icon> Find Users to Follow
        </a>
        <a mat-stroked-button routerLink="/posts/new">
          <mat-icon>add</mat-icon> Create Your First Post
        </a>
      </div>

      <app-post-card
        *ngFor="let post of posts"
        [post]="post"
        (likeToggle)="toggleLike($event)"
        (deletePost)="deletePost($event)"
        (reportUser)="openReport($event)">
      </app-post-card>

      <div style="text-align:center;margin:16px" *ngIf="!loading && !lastPage && posts.length > 0">
        <button mat-stroked-button (click)="loadMore()">Load More</button>
      </div>

    </div>
  `
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  page = 0;
  lastPage = false;

  constructor(private postService: PostService, private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit() { this.loadPosts(); }

  loadPosts() {
    this.loading = true;
    this.postService.getFeed(this.page).subscribe({
      next: (p) => { this.posts = [...this.posts, ...p.content]; this.lastPage = p.last; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadMore() { this.page++; this.loadPosts(); }

  toggleLike(postId: number) {
    this.postService.toggleLike(postId).subscribe(updated => {
      this.posts = this.posts.map(p => p.id === postId ? updated : p);
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
