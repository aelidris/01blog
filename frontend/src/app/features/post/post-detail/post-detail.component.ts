import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post } from '../../../core/models/post.model';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDividerModule, MatProgressSpinnerModule],
  template: `
    <!-- Constrained to 1200px max-width, centered with padding and gap -->
    <div style="max-width: 1200px; margin: 24px auto; padding: 0 16px; display: flex; flex-direction: column; gap: 16px;" *ngIf="post">
      <mat-card style="border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <mat-card-header>
          <mat-card-title><a [routerLink]="['/block', post.author.username]" style="color: #3f51b5; text-decoration: none;">{{ post.author.username }}</a></mat-card-title>
          <mat-card-subtitle>{{ post.createdAt | date:'medium' }}</mat-card-subtitle>
        </mat-card-header>
        <ng-container *ngIf="post.mediaUrl">
          <img *ngIf="post.mediaType?.startsWith('image/')" mat-card-image [src]="mediaUrl()" style="max-height:500px;object-fit:cover">
          <video *ngIf="!post.mediaType?.startsWith('image/')" mat-card-image controls style="width:100%"><source [src]="mediaUrl()"></video>
        </ng-container>
        <mat-card-content>
          <p style="font-size: 1rem; color: #333; line-height: 1.5; margin-top: 8px;">{{ post.description }}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="toggleLike()" [color]="post.likedByCurrentUser ? 'primary' : ''">
            <mat-icon>{{ post.likedByCurrentUser ? 'favorite' : 'favorite_border' }}</mat-icon> {{ post.likeCount }}
          </button>
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
            <button mat-icon-button color="warn" *ngIf="canDelete(c)" (click)="deleteComment(c.id)" title="Delete comment">
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

  constructor(
    private route: ActivatedRoute, private postService: PostService, private router: Router,
    public auth: AuthService, fb: FormBuilder
  ) {
    this.commentForm = fb.group({ content: ['', [Validators.required, Validators.maxLength(1000)]] });
  }

  ngOnInit() {
    const postId = Number(this.route.snapshot.paramMap.get('id'));
    
    this.postService.getPost(postId).subscribe({
      next: (data) => {
        this.post = data;
      },
      error: (err) => {
        // If the post was deleted or doesn't exist, redirect back to feed immediately
        if (err.status == 404 || (err.error && err.error.error === 'Post not found')) {
          this.router.navigate(['/feed']);
        } else {
          console.error('Failed to load post', err);
        }
      }
    });
  }

  toggleLike() {
    if (!this.post) return;
    
    this.postService.toggleLike(this.post.id).subscribe({
      next: (updated) => {
        this.post = updated;
      },
      error: (err) => {
        if (err.status == 404 || (err.error && err.error.error === 'Post not found')) {
          // If the post was deleted while viewing its detail page, redirect to feed
          this.router.navigate(['/feed']);
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
        // Check if status is 404 OR if the error body is the string 'Post not found'
        if (err.status == 404 || err.error === 'Post not found' || (err.error && err.error.error === 'Post not found')) {
          this.router.navigate(['/feed']); 
        } else {
          console.error('Failed to add comment', err);
        }
      }
    });
  }

  deleteComment(commentId: number) {
    this.postService.deleteComment(commentId).subscribe(() => {
      this.post!.comments = this.post!.comments.filter(c => c.id !== commentId);
    });
  }

  canDelete(c: any) { return this.auth.currentUser()?.id === c.author.id || this.auth.isAdmin(); }
  mediaUrl() { return `http://localhost:8080${this.post?.mediaUrl}`; }
}
