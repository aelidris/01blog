import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Report } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}
  createReport(reportedUserId: number, reason: string) {
    return this.http.post<Report>(`${this.base}/reports`, { reportedUserId, reason });
  }
}
