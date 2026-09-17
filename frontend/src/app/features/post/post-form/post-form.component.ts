import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PostService } from '../../../core/services/post.service';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div style="max-width: 1200px; margin: 24px auto; padding: 0 16px;">
      <mat-card style="border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <mat-card-header style="padding: 20px 24px 0;">
          <mat-card-title style="font-size: 1.25rem; font-weight: 600;">{{ isEdit ? 'Edit Post' : 'Create New Post' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content style="padding: 24px;">
          <form [formGroup]="form" (ngSubmit)="submit()" style="display:flex; flex-direction:column; gap:20px;">
            
            <mat-form-field appearance="outline" style="width: 100%;">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="5" placeholder="Share your learning experience or thoughts..."></textarea>
              <mat-error *ngIf="form.get('description')?.hasError('required')">Description is required</mat-error>
              <mat-error *ngIf="form.get('description')?.hasError('maxlength')">Description cannot exceed 2000 characters</mat-error>
            </mat-form-field>

            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <button type="button" mat-stroked-button color="primary" (click)="fileInput.click()" style="height: 38px;">
                <mat-icon style="margin-right: 4px;">attach_file</mat-icon> 
                {{ selectedFile || previewUrl ? 'Change File' : 'Upload Image/Video' }}
              </button>
              <span *ngIf="selectedFile" style="font-size: 0.85rem; color: #555; background: #f5f5f5; padding: 6px 12px; border-radius: 4px; border: 1px solid #ddd;">
                {{ selectedFile.name }}
              </span>
              <input #fileInput type="file" accept="image/jpeg,image/png,video/mp4" hidden (change)="onFileSelected($event)">
            </div>

            <!-- Preview Container with Delete Button -->
            <div *ngIf="previewUrl" style="background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #eee; text-align: center; position: relative; max-width: fit-content; margin: 0 auto;">
              <button mat-mini-fab color="warn" type="button" (click)="removeMedia()" style="position: absolute; top: 16px; right: 16px; z-index: 10;" title="Remove media">
                <mat-icon>delete</mat-icon>
              </button>
              <img *ngIf="isImagePreview" [src]="previewUrl" style="max-width: 100%; max-height: 300px; object-fit: cover; border-radius: 4px; display: block;">
              <video *ngIf="!isImagePreview" [src]="previewUrl" controls style="max-width: 100%; max-height: 300px; border-radius: 4px; display: block;"></video>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f0f0f0; padding-top: 16px; margin-top: 4px;">
              <button mat-button type="button" (click)="router.navigate(['/feed'])" style="color: #666;">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading" style="height: 36px; padding: 0 24px;">
                {{ loading ? 'Saving...' : (isEdit ? 'Update Post' : 'Publish') }}
              </button>
            </div>

          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class PostFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isEdit = false;
  postId?: number;
  loading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isImagePreview = false;
  removeMediaFlag = false;
  private objectUrlToRevoke: string | null = null;

  constructor(
    fb: FormBuilder, private route: ActivatedRoute,
    public router: Router, private postService: PostService, private snack: MatSnackBar,
    private http: HttpClient
  ) {
    this.form = fb.group({ description: ['', [Validators.required, Validators.maxLength(2000)]] });
  }

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id') ? +this.route.snapshot.paramMap.get('id')! : undefined;
    this.isEdit = !!this.postId;
    if (this.isEdit) {
      this.postService.getPost(this.postId!).subscribe(p => {
        this.form.patchValue({ description: p.description });
        
        if (p.mediaUrl) {
          this.isImagePreview = !/\.(mp4|webm|ogg|mov)$/i.test(p.mediaUrl);
          
          if (p.mediaUrl.startsWith('http')) {
            this.previewUrl = p.mediaUrl;
          } else {
            const filename = p.mediaUrl.replace('/uploads/', '');
            const url = `http://localhost:8080/api/media/${filename}`;

            this.http.get(url, { responseType: 'blob' }).subscribe({
              next: (blob) => {
                this.objectUrlToRevoke = URL.createObjectURL(blob);
                this.previewUrl = this.objectUrlToRevoke;
              },
              error: (err) => console.error('Failed to load post media for editing', err)
            });
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.objectUrlToRevoke) {
      URL.revokeObjectURL(this.objectUrlToRevoke);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;

    const fileName = f.name.toLowerCase();
    const isJpgOrPng = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');
    const isMp4 = fileName.endsWith('.mp4');

    if (!isJpgOrPng && !isMp4) {
      this.snack.open('Only JPEG, PNG images and MP4 videos are allowed', 'Close', { duration: 4000 });
      input.value = '';
      return;
    }

    this.selectedFile = f;
    this.isImagePreview = isJpgOrPng;
    this.removeMediaFlag = false;

    if (this.objectUrlToRevoke) {
      URL.revokeObjectURL(this.objectUrlToRevoke);
      this.objectUrlToRevoke = null;
    }

    const reader = new FileReader();
    reader.onload = e => this.previewUrl = e.target?.result as string;
    reader.readAsDataURL(f);
  }

  removeMedia() {
    if (this.objectUrlToRevoke) {
      URL.revokeObjectURL(this.objectUrlToRevoke);
      this.objectUrlToRevoke = null;
    }
    this.previewUrl = null;
    this.selectedFile = null;
    this.removeMediaFlag = true;
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const fd = new FormData();
    fd.append('description', this.form.value.description);
    fd.append('removeMedia', String(this.removeMediaFlag));

    if (this.selectedFile) {
      fd.append('media', this.selectedFile);
    }

    const req = this.isEdit
      ? this.postService.updatePost(this.postId!, fd)
      : this.postService.createPost(fd);

    req.subscribe({
      next: (p) => { this.snack.open('Saved!', 'Close', { duration: 2000 }); this.router.navigate(['/posts', p.id]); },
      error: (e) => { this.snack.open(e.error?.error || 'Save failed', 'Close', { duration: 3000 }); this.loading = false; }
    });
  }
}