import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatDividerModule],
  template: `
    <div class="page-container" style="max-width:500px">
      <mat-card>
        <mat-card-header><mat-card-title>Edit Profile</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()" style="display:flex;flex-direction:column;gap:16px;margin-top:16px">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Bio</mat-label>
              <textarea matInput formControlName="bio" rows="4" placeholder="Tell us about yourself..."></textarea>
            </mat-form-field>
            <div style="display:flex;gap:12px">
              <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                {{ loading ? 'Saving...' : 'Save' }}
              </button>
              <button mat-button type="button" (click)="router.navigate(['/feed'])">Cancel</button>
            </div>
          </form>

          <mat-divider style="margin:24px 0"></mat-divider>
          
          <h3>Update Avatar</h3>
          <div style="display:flex;align-items:center;gap:16px;margin-top:12px">
            
            <div style="width:70px;height:70px;border-radius:50%;overflow:hidden;background:#eee;display:flex;align-items:center;justify-content:center;border:2px solid #3f51b5;flex-shrink:0;">
              <img *ngIf="avatarPreview" [src]="avatarPreview" alt="Preview" style="width:100%;height:100%;object-fit:cover">
              <img *ngIf="!avatarPreview && currentAvatarUrl" [src]="'http://localhost:8080' + currentAvatarUrl" alt="Avatar" style="width:100%;height:100%;object-fit:cover">
              <mat-icon *ngIf="!avatarPreview && !currentAvatarUrl" style="color:#aaa;font-size:32px;width:32px;height:32px">person</mat-icon>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;flex-grow:1">
              <input #fileInput type="file" accept="image/*" hidden (change)="onAvatarSelected($event)">
              <button mat-stroked-button type="button" (click)="fileInput.click()">Choose Image</button>
              <button mat-raised-button color="accent" (click)="uploadAvatar()" [disabled]="!avatarFile || uploading">
                {{ uploading ? 'Uploading...' : 'Upload Avatar' }}
              </button>
            </div>

          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class EditProfileComponent implements OnInit {
  form: FormGroup;
  loading = false;
  uploading = false;
  currentUser: any = null;
  avatarFile: File | null = null;
  avatarPreview: string | null = null;
  currentAvatarUrl: string | null = null;

  constructor(
    fb: FormBuilder, private userService: UserService,
    public router: Router, private auth: AuthService, private snack: MatSnackBar
  ) {
    this.form = fb.group({ bio: [''] });
  }

  ngOnInit() {
    const u = this.auth.currentUser();
    if (u) {
      this.form.patchValue({ bio: u.bio });
      this.currentAvatarUrl = u.avatarUrl ?? null;
    }
  }

  save() {
    this.loading = true;
    this.userService.updateProfile(this.form.value.bio).subscribe({
      next: (u) => { this.auth.refreshCurrentUser(u); this.snack.open('Profile updated', 'Close', { duration: 2000 }); this.loading = false; },
      error: () => { this.snack.open('Update failed', 'Close', { duration: 2000 }); this.loading = false; }
    });
  }

  onAvatarSelected(event: Event) {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.avatarFile = f;
    const reader = new FileReader();
    reader.onload = e => this.avatarPreview = e.target?.result as string;
    reader.readAsDataURL(f);
  }

  uploadAvatar() {
    if (!this.avatarFile) return;
    this.uploading = true;
    const fd = new FormData();
    fd.append('file', this.avatarFile);
    this.userService.updateAvatar(fd).subscribe({
      next: (u) => { 
        this.currentUser = u; 
        this.auth.refreshCurrentUser(u); 
        this.currentAvatarUrl = u.avatarUrl ?? null;
        this.avatarPreview = null;
        this.avatarFile = null;
        this.snack.open('Avatar updated', 'Close', { duration: 2000 }); 
        this.uploading = false; 
      },
      error: (err) => { 
        console.error('Upload failed error:', err); 
        this.snack.open('Upload failed', 'Close', { duration: 2000 }); 
        this.uploading = false; 
      }
    });
  }
}