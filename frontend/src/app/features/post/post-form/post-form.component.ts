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
    <div class="page-container" style="max-width:600px">
      <mat-card>
        <mat-card-header><mat-card-title>{{ isEdit ? 'Edit Post' : 'New Post' }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" style="display:flex;flex-direction:column;gap:16px;margin-top:16px">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="5" placeholder="Share your learning experience..."></textarea>
              <mat-error *ngIf="form.get('description')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <div>
              <button type="button" mat-stroked-button (click)="fileInput.click()">
                <mat-icon>attach_file</mat-icon> {{ selectedFile ? selectedFile.name : 'Upload Image/Video' }}
              </button>
              <input #fileInput type="file" accept="image/*,video/*" hidden (change)="onFileSelected($event)">
            </div>

            <div *ngIf="previewUrl" style="margin-top:8px">
              <img *ngIf="isImagePreview" [src]="previewUrl" style="max-width:100%;max-height:300px;object-fit:cover;border-radius:4px">
              <video *ngIf="!isImagePreview" [src]="previewUrl" controls style="max-width:100%;max-height:300px"></video>
            </div>

            <div style="display:flex;gap:12px">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
                {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Publish') }}
              </button>
              <button mat-button type="button" (click)="router.navigate(['/feed'])">Cancel</button>
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
