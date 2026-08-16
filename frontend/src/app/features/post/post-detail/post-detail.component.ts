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
    <div class="page-container" *ngIf="post">
      <mat-card>
        <mat-card-header>
          <mat-card-title><a [routerLink]="['/block', post.author.username]">{{ post.author.username }}</a></mat-card-title>
          <mat-card-subtitle>{{ post.createdAt | date:'medium' }}</mat-card-subtitle>
        </mat-card-header>
        <ng-container *ngIf="post.mediaUrl">
          <img *ngIf="post.mediaType?.startsWith('image/')" mat-card-image [src]="mediaUrl()" style="max-height:500px;object-fit:cover">
          <video *ngIf="!post.mediaType?.startsWith('image/')" mat-card-image controls style="width:100%"><source [src]="mediaUrl()"></video>
        </ng-container>
        <mat-card-content>
          <p>{{ post.description }}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="toggleLike()" [color]="post.likedByCurrentUser ? 'primary' : ''">
            <mat-icon>{{ post.likedByCurrentUser ? 'favorite' : 'favorite_border' }}</mat-icon> {{ post.likeCount }}
          </button>
        </mat-card-actions>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title>Comments ({{ post.comments.length }})</mat-card-title></mat-card-header>
        <mat-card-content>
          <div *ngFor="let c of post.comments" style="margin:12px 0">
            <strong><a [routerLink]="['/block', c.author.username]">{{ c.author.username }}</a></strong>
            <span style="color:#888;font-size:0.8em;margin-left:8px">{{ c.createdAt | date:'short' }}</span>
            <p style="margin:4px 0">{{ c.content }}</p>
            <button mat-icon-button color="warn" *ngIf="canDelete(c)" (click)="deleteComment(c.id)">
              <mat-icon style="font-size:16px">close</mat-icon>
            </button>
            <mat-divider></mat-divider>
          </div>

          <form [formGroup]="commentForm" (ngSubmit)="addComment()" style="display:flex;gap:8px;margin-top:16px" *ngIf="auth.isLoggedIn()">
            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>Add a comment...</mat-label>
              <input matInput formControlName="content">
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="commentForm.invalid">Post</button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
    <div *ngIf="!post && loading" style="text-align:center;padding:40px"><mat-spinner [diameter]="40" style="margin:auto"></mat-spinner></div>
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
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.postService.getPost(id).subscribe({ next: p => { this.post = p; this.loading = false; } });
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
    if (!this.post || this.commentForm.invalid) return;
    this.postService.addComment(this.post.id, this.commentForm.value.content).subscribe(comment => {
      this.post!.comments.push(comment);
      this.commentForm.reset();
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
