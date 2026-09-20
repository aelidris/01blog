import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post } from '../../../core/models/post.model';

@Component({
  selector: 'app-post-unavailable-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, RouterLink],
  template: `
    <h2 mat-dialog-title>Post Unavailable</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" routerLink="/feed" mat-dialog-close>
        Back to Feed
      </button>
    </mat-dialog-actions>
  `
})
export class PostUnavailableDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) {}
}

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, 
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, 
    MatDividerModule, MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div style="max-width: 1200px; margin: 24px auto; padding: 0 16px; display: flex; flex-direction: column; gap: 16px;" *ngIf="post">
      <mat-card style="border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <mat-card-header>
          <mat-card-title><a [routerLink]="['/block', post.author.username]" style="color: #3f51b5; text-decoration: none;">{{ post.author.username }}</a></mat-card-title>
          <mat-card-subtitle>{{ post.createdAt | date:'medium' }}</mat-card-subtitle>
        </mat-card-header>
        <ng-container *ngIf="secureMediaUrl">
          <img *ngIf="post?.mediaType?.startsWith('image/')" mat-card-image [src]="secureMediaUrl" style="width: 100%; height: auto; max-height: 500px; object-fit: contain; border-radius: 8px; display: block;">
          <video *ngIf="!post?.mediaType?.startsWith('image/')" mat-card-image controls style="width:100%"><source [src]="secureMediaUrl"></video>
        </ng-container>
        <mat-card-content>
          <p style="font-size: 1rem; color: #333; line-height: 1.5; margin-top: 8px;">{{ post.description }}</p>
        </mat-card-content>
        <mat-card-actions>
          <!-- Like Button -->
          <button mat-button (click)="toggleLike()" [color]="post.likedByCurrentUser ? 'primary' : ''">
            <mat-icon>{{ post.likedByCurrentUser ? 'favorite' : 'favorite_border' }}</mat-icon> {{ post.likeCount }}
          </button>

          <span style="flex: 1"></span>

          <!-- Owner Actions: Edit & Delete protected with safety checks -->
          <ng-container *ngIf="isOwnerOrAdmin()">
            <button mat-icon-button color="primary" (click)="onEdit()" title="Edit post">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="onDelete()" title="Delete post">
              <mat-icon>delete</mat-icon>
            </button>
          </ng-container>
        </mat-card-actions>
      </mat-card>

      <mat-card style="border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <mat-card-header><mat-card-title style="font-size: 1.1rem; font-weight: 600;">Comments ({{ post.comments.length }})</mat-card-title></mat-card-header>
        <mat-card-content style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
          <div *ngFor="let c of post.comments" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 12px; background: #fafafa; border-radius: 8px; border: 1px solid #eee;">
            <div style="display: flex; flex-direction: column; gap: 4px; flex-grow: 1;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong><a [routerLink]="['/block', c.author.username]" style="color: #3f51b5; text-decoration: none; font-size: 0.9rem;">{{ c.author.username }}</a></strong>
                <span style="color: #888; font-size: 0.75rem;">{{ c.createdAt | date:'short' }}</span>
              </div>
              <p style="margin: 0; font-size: 0.95rem; word-break: break-all; white-space: pre-wrap; color: #333;">{{ c.content }}</p>
            </div>
            <button mat-icon-button color="warn" *ngIf="canDeleteComment(c)" (click)="deleteComment(c.id)" title="Delete comment">
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;">delete_outline</mat-icon>
            </button>
          </div>
          <form [formGroup]="commentForm" (ngSubmit)="addComment()" style="display:flex; gap:8px; margin-top:16px;" *ngIf="auth.isLoggedIn()">
            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>Add a comment...</mat-label>
              <input matInput formControlName="content">
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="commentForm.invalid" style="height: 56px;">Post</button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
    <div *ngIf="!post && loading" style="text-align:center;padding:48px"><mat-spinner [diameter]="40" style="margin:auto"></mat-spinner></div>
  `
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  loading = true;
  commentForm: FormGroup;
  secureMediaUrl: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private postService: PostService, 
    private router: Router, 
    private http: HttpClient,
    private dialog: MatDialog,
    public auth: AuthService, 
    fb: FormBuilder
  ) {
    this.commentForm = fb.group({ content: ['', [Validators.required, Validators.maxLength(1000)]] });
  }

  ngOnInit() {
    const postId = Number(this.route.snapshot.paramMap.get('id'));
    
    this.postService.getPost(postId).subscribe({
      next: (data) => {
        this.post = data;
        this.loading = false;
        
        if (this.post.mediaUrl) {
          this.loadSecureMedia(this.post.mediaUrl);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403 || err.status === 404) {
          this.showUnavailableDialog();
        }
      }
    });
  }

  showUnavailableDialog() {
    this.dialog.open(PostUnavailableDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { message: 'This post has been hidden or deleted by the administrator.' }
    });
  }

  loadSecureMedia(mediaUrl: string) {
    const filename = mediaUrl.replace('/uploads/', '');
    const url = `http://localhost:8080/api/media/${filename}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.secureMediaUrl = URL.createObjectURL(blob);
      },
      error: (err) => {
        console.error('Failed to load secure media', err);
      }
    });
  }

  ngOnDestroy() {
    if (this.secureMediaUrl) {
      URL.revokeObjectURL(this.secureMediaUrl);
    }
  }

  toggleLike() {
    if (!this.post) return;
    
    this.postService.toggleLike(this.post.id).subscribe({
      next: (updated) => {
        this.post = updated;
      },
      error: (err) => {
        if (err.status === 403 || err.status === 404 || (err.error && err.error.error === 'Post not found')) {
          this.showUnavailableDialog();
        } else {
          console.error('Failed to toggle like', err);
        }
      }
    });
  }

  addComment() {
    if (this.commentForm.invalid || !this.post) return;

    const content = this.commentForm.value.content;

    this.postService.addComment(this.post.id, content).subscribe({
      next: (newComment) => {
        this.post?.comments?.push(newComment);
        this.commentForm.reset();
      },
      error: (err) => {
        if (err.status === 403 || err.status === 404 || err.error === 'Post not found' || (err.error && err.error.error === 'Post not found')) {
          this.showUnavailableDialog(); 
        } else {
          console.error('Failed to add comment', err);
        }
      }
    });
  }

  // Safe handler for Edit icon click
  onEdit() {
    if (!this.post) return;
    // Verify post is still active before routing, or catch error from server
    this.postService.getPost(this.post.id).subscribe({
      next: () => {
        this.router.navigate(['/posts', this.post!.id, 'edit']);
      },
      error: (err) => {
        if (err.status === 403 || err.status === 404) {
          this.showUnavailableDialog();
        }
      }
    });
  }

  // Safe handler for Delete icon click
  onDelete() {
    if (!this.post) return;
    
    this.postService.deletePost(this.post.id).subscribe({
      next: () => {
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        if (err.status === 403 || err.status === 404) {
          this.showUnavailableDialog();
        } else {
          console.error('Failed to delete post', err);
        }
      }
    });
  }

  deleteComment(commentId: number) {
    this.postService.deleteComment(commentId).subscribe({
      next: () => {
        this.post!.comments = this.post!.comments.filter(c => c.id !== commentId);
      },
      error: (err) => {
        if (err.status === 403 || err.status === 404) {
          this.showUnavailableDialog();
        }
      }
    });
  }

  isOwnerOrAdmin() { 
    return this.auth.currentUser()?.id === this.post?.author?.id || this.auth.isAdmin(); 
  }

  canDeleteComment(c: any) { 
    return this.auth.currentUser()?.id === c.author.id || this.auth.isAdmin(); 
  }
}
