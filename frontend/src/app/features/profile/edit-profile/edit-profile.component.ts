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
    <!-- Balanced max-width for forms and settings pages -->
    <div style="max-width: 1200px; margin: 24px auto; padding: 0 16px;">
      <mat-card style="border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); border-radius: 8px;">
        <mat-card-header style="padding: 20px 24px 0;">
          <mat-card-title style="font-size: 1.25rem; font-weight: 600;">Edit Profile</mat-card-title>
        </mat-card-header>
        <mat-card-content style="padding: 24px;">
          <form [formGroup]="form" (ngSubmit)="save()" style="display:flex;flex-direction:column;gap:16px;">
            <mat-form-field appearance="outline" style="width: 100%;">
              <mat-label>Bio</mat-label>
              <textarea matInput formControlName="bio" rows="4" placeholder="Tell us about yourself..."></textarea>
            </mat-form-field>
            <div style="display:flex;gap:12px">
              <button mat-raised-button color="primary" type="submit" [disabled]="loading" style="flex: 1;">
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
              <button mat-stroked-button type="button" (click)="router.navigate(['/feed'])" style="flex: 1;">Cancel</button>
            </div>
          </form>

          <mat-divider style="margin:24px 0"></mat-divider>
          
          <h3 style="margin-top: 0; font-size: 1.1rem; color: #444;">Update Avatar</h3>
          <div style="display:flex;align-items:center;gap:16px;margin-top:12px; flex-wrap: wrap;">
            
            <div style="width:70px;height:70px;border-radius:50%;overflow:hidden;background:#eee;display:flex;align-items:center;justify-content:center;border:2px solid #3f51b5;flex-shrink:0;">
              <img *ngIf="avatarPreview" [src]="avatarPreview" alt="Preview" style="width:100%;height:100%;object-fit:cover">
              <img *ngIf="!avatarPreview && currentAvatarUrl" [src]="'http://localhost:8080' + currentAvatarUrl" alt="Avatar" style="width:100%;height:100%;object-fit:cover">
              <mat-icon *ngIf="!avatarPreview && !currentAvatarUrl" style="color:#aaa;font-size:32px;width:32px;height:32px">person</mat-icon>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;flex-grow:1; min-width: 200px;">
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