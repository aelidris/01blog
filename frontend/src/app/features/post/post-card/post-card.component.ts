import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Post } from '../../../core/models/post.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatChipsModule],
  template: `
    <mat-card>
      <mat-card-header>
        <div mat-card-avatar style="background:#3f51b5;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;overflow:hidden">
          <!-- Avatar secure (ila kayna) -->
          <img *ngIf="post.author?.avatarUrl && secureAvatarUrl" 
               [src]="secureAvatarUrl" 
               alt="{{ post.author.username }}"
               style="width:100%;height:100%;object-fit:cover">

          <span *ngIf="!post.author?.avatarUrl">
            {{ post.author?.username?.[0]?.toUpperCase() }}
          </span>
        </div>

        <mat-card-title>
          <a [routerLink]="['/block', post.author.username]">{{ post.author.username }}</a>
        </mat-card-title>
        <mat-card-subtitle>{{ post.createdAt | date:'medium' }}</mat-card-subtitle>
      </mat-card-header>

      <!-- Secure Media -->
      <ng-container *ngIf="secureMediaUrl">
        <img *ngIf="isImage()" mat-card-image [src]="secureMediaUrl" [alt]="post.description" style="width: 100%; height: auto; max-height: 500px; object-fit: contain; border-radius: 8px; display: block;">
        <video *ngIf="!isImage()" mat-card-image controls style="width:100%;max-height:400px">
          <source [src]="secureMediaUrl">
        </video>
      </ng-container>

      <mat-card-content>
        <p>{{ post.description }}</p>
      </mat-card-content>

      <mat-card-actions>
        <button mat-button (click)="likeToggle.emit(post.id)" [color]="post.likedByCurrentUser ? 'primary' : ''">
          <mat-icon>{{ post.likedByCurrentUser ? 'favorite' : 'favorite_border' }}</mat-icon>
          {{ post.likeCount }}
        </button>
        <a mat-button [routerLink]="['/posts', post.id]">
          <mat-icon>comment</mat-icon> {{ post.comments.length }}
        </a>
        <span class="spacer"></span>
        <ng-container *ngIf="isOwner()">
          <a mat-icon-button [routerLink]="['/posts', post.id, 'edit']"><mat-icon>edit</mat-icon></a>
          <button mat-icon-button color="warn" (click)="deletePost.emit(post.id)"><mat-icon>delete</mat-icon></button>
        </ng-container>
        <button mat-icon-button (click)="reportUser.emit(post.author.id)" *ngIf="!isOwner()">
          <mat-icon>flag</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `
})
export class PostCardComponent implements OnInit, OnDestroy {
  @Input() post!: Post;
  @Output() likeToggle = new EventEmitter<number>();
  @Output() deletePost = new EventEmitter<number>();
  @Output() reportUser = new EventEmitter<number>();

  secureMediaUrl: string | null = null;
  secureAvatarUrl: string | null = null;

  constructor(private auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    if (this.post.mediaUrl) {
      this.loadSecureFile(this.post.mediaUrl, 'media');
    }
    if (this.post.author?.avatarUrl) {
      this.loadSecureFile(this.post.author.avatarUrl, 'avatar');
    }
  }

  loadSecureFile(urlPath: string, type: 'media' | 'avatar') {
    const filename = urlPath.replace('/uploads/', '');
    const url = `http://localhost:8080/api/media/${filename}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        if (type === 'media') {
          this.secureMediaUrl = objectUrl;
        } else {
          this.secureAvatarUrl = objectUrl;
        }
      },
      error: (err) => console.error(`Failed to load secure ${type}`, err)
    });
  }

  ngOnDestroy() {
    if (this.secureMediaUrl) URL.revokeObjectURL(this.secureMediaUrl);
    if (this.secureAvatarUrl) URL.revokeObjectURL(this.secureAvatarUrl);
  }

  isOwner() { return this.auth.currentUser()?.id === this.post.author.id; }
  isImage() { return this.post.mediaType?.startsWith('image/'); }
}