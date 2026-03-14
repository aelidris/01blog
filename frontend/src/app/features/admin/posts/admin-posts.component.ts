import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../../core/services/admin.service';
import { Post } from '../../../core/models/post.model';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <h2>Manage Posts</h2>
      <mat-card *ngIf="loading" style="text-align:center;padding:32px">
        <mat-spinner [diameter]="40" style="margin:auto"></mat-spinner>
      </mat-card>
      <mat-card *ngIf="!loading">
        <table mat-table [dataSource]="posts" style="width:100%">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let p">{{ p.id }}</td>
          </ng-container>
          <ng-container matColumnDef="author">
            <th mat-header-cell *matHeaderCellDef>Author</th>
            <td mat-cell *matCellDef="let p">{{ p.author.username }}</td>
          </ng-container>
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let p" style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              {{ p.description }}
            </td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let p">{{ p.createdAt | date:'short' }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let p">
              <mat-chip [color]="p.hidden ? 'warn' : 'primary'" highlighted>{{ p.hidden ? 'HIDDEN' : 'VISIBLE' }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p">
              <a mat-icon-button [routerLink]="['/posts', p.id]" matTooltip="View"><mat-icon>visibility</mat-icon></a>
              <button mat-icon-button (click)="toggleHide(p)" [color]="p.hidden ? 'primary' : 'warn'"
                [matTooltip]="p.hidden ? 'Show' : 'Hide'">
                <mat-icon>{{ p.hidden ? 'visibility' : 'visibility_off' }}</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deletePost(p)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
      </mat-card>
    </div>
  `
})
export class AdminPostsComponent implements OnInit {
  posts: Post[] = [];
  cols = ['id', 'author', 'description', 'date', 'status', 'actions'];
  loading = true;

  constructor(private adminService: AdminService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.adminService.getPosts().subscribe({ next: p => { this.posts = p.content; this.loading = false; } });
  }

  toggleHide(post: Post) {
    const action = (post as any).hidden ? this.adminService.unhidePost(post.id) : this.adminService.hidePost(post.id);
    action.subscribe({
      next: (p) => { this.posts = this.posts.map(x => x.id === p.id ? p : x); this.snack.open('Updated', 'Close', { duration: 2000 }); }
    });
  }

  deletePost(post: Post) {
    if (!confirm('Delete this post permanently?')) return;
    this.adminService.deletePost(post.id).subscribe({
      next: () => { this.posts = this.posts.filter(p => p.id !== post.id); this.snack.open('Deleted', 'Close', { duration: 2000 }); }
    });
  }
}
