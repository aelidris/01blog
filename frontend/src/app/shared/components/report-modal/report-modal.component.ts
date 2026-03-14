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
    <h2 mat-dialog-title>Report User</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reason</mat-label>
          <textarea matInput formControlName="reason" rows="4" placeholder="Describe the inappropriate behavior..."></textarea>
          <mat-error *ngIf="form.get('reason')?.hasError('required')">Reason is required</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="warn" (click)="submit()" [disabled]="form.invalid || loading">
        {{ loading ? 'Submitting...' : 'Submit Report' }}
      </button>
    </mat-dialog-actions>
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
    this.form = fb.group({ reason: ['', [Validators.required, Validators.maxLength(1000)]] });
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
