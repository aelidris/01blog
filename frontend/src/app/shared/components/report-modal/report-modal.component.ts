import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReportService } from '../../../core/services/report.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title style="margin-bottom: 0; font-weight: 600;">Report User</h2>
    
    <mat-dialog-content class="report-content" style="padding-top: 12px;">
      <p style="color: #666; font-size: 0.9rem; margin-bottom: 16px; word-break: break-word;">
        Please describe why you are reporting this user. This will be reviewed by site administrators.
      </p>
      <form [formGroup]="form" style="display: flex; flex-direction: column;">
        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Reason for report</mat-label>
          <textarea matInput formControlName="reason" rows="4" placeholder="Describe the inappropriate behavior..."></textarea>
          <mat-error *ngIf="form.get('reason')?.hasError('required')">Reason is required</mat-error>
          <mat-error *ngIf="form.get('reason')?.hasError('maxlength')">Reason cannot exceed 300 characters</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="report-actions" style="padding: 16px 24px; gap: 8px;">
      <button mat-button mat-dialog-close style="color: #666;">Cancel</button>
      <button mat-raised-button color="warn" (click)="submit()" [disabled]="form.invalid || loading">
        {{ loading ? 'Submitting...' : 'Submit Report' }}
      </button>
    </mat-dialog-actions>

    <style>
      .report-content {
        width: 100%;
        max-width: 450px;
        box-sizing: border-box;
      }

      @media (max-width: 480px) {
        .report-actions {
          flex-direction: column-reverse;
          align-items: stretch !important;
          width: 100%;
          box-sizing: border-box;
        }
        .report-actions button {
          width: 100%;
          margin: 0 !important;
        }
      }
    </style>
  `
})
export class ReportModalComponent {
  form: FormGroup;
  loading = false;

  constructor(
    fb: FormBuilder,
    private dialogRef: MatDialogRef<ReportModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number },
    private reportService: ReportService,
    private snack: MatSnackBar
  ) {
    this.form = fb.group({ reason: ['', [Validators.required, Validators.maxLength(300)]] });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.reportService.createReport(this.data.userId, this.form.value.reason).subscribe({
      next: () => { this.snack.open('Report submitted', 'Close', { duration: 3000 }); this.dialogRef.close(true); },
      error: () => { this.snack.open('Failed to submit report', 'Close', { duration: 3000 }); this.loading = false; }
    });
  }
}
