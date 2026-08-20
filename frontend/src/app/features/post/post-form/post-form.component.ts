import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    <div class="page-container" style="max-width: 650px; margin: 0 auto; padding: 24px;">
      <mat-card style="border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); padding: 12px;">
        <mat-card-header style="margin-bottom: 12px;">
          <mat-card-title style="font-weight: 600;">{{ isEdit ? 'Edit Post' : 'Create New Post' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" style="display:flex; flex-direction:column; gap:20px; margin-top:8px">
            
            <mat-form-field appearance="outline" style="width: 100%;">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="5" placeholder="Share your learning experience or thoughts..."></textarea>
              <mat-error *ngIf="form.get('description')?.hasError('required')">Description is required</mat-error>
              <mat-error *ngIf="form.get('description')?.hasError('maxlength')">Description cannot exceed 2000 characters</mat-error>
            </mat-form-field>

            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <button type="button" mat-stroked-button color="primary" (click)="fileInput.click()" style="height: 38px;">
                <mat-icon style="margin-right: 4px;">attach_file</mat-icon> 
                {{ selectedFile ? 'Change File' : 'Upload Image/Video' }}
              </button>
              <span *ngIf="selectedFile" style="font-size: 0.85rem; color: #555; background: #f5f5f5; padding: 6px 12px; border-radius: 4px; border: 1px solid #ddd;">
                {{ selectedFile.name }}
              </span>
              <input #fileInput type="file" accept="image/*,video/*" hidden (change)="onFileSelected($event)">
            </div>

            <div *ngIf="previewUrl" style="margin-top: 4px; background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #eee; text-align: center;">
              <img *ngIf="isImagePreview" [src]="previewUrl" style="max-width: 100%; max-height: 300px; object-fit: cover; border-radius: 4px;">
              <video *ngIf="!isImagePreview" [src]="previewUrl" controls style="max-width: 100%; max-height: 300px; border-radius: 4px;"></video>
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
export class PostFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  postId?: number;
  loading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isImagePreview = false;

  constructor(
    fb: FormBuilder, private route: ActivatedRoute,
    public router: Router, private postService: PostService, private snack: MatSnackBar
  ) {
    this.form = fb.group({ description: ['', [Validators.required, Validators.maxLength(2000)]] });
  }

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id') ? +this.route.snapshot.paramMap.get('id')! : undefined;
    this.isEdit = !!this.postId;
    if (this.isEdit) {
      this.postService.getPost(this.postId!).subscribe(p => this.form.patchValue({ description: p.description }));
    }
  }

  onFileSelected(event: Event) {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.selectedFile = f;
    this.isImagePreview = f.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = e => this.previewUrl = e.target?.result as string;
    reader.readAsDataURL(f);
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const fd = new FormData();
    fd.append('description', this.form.value.description);
    if (this.selectedFile) fd.append('media', this.selectedFile);

    const req = this.isEdit
      ? this.postService.updatePost(this.postId!, fd)
      : this.postService.createPost(fd);

    req.subscribe({
      next: (p) => { this.snack.open('Saved!', 'Close', { duration: 2000 }); this.router.navigate(['/posts', p.id]); },
      error: (e) => { this.snack.open(e.error?.error || 'Save failed', 'Close', { duration: 3000 }); this.loading = false; }
    });
  }
}
