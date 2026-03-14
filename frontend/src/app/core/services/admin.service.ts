import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { Post, Page } from '../models/post.model';
import { Report } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;
  constructor(private http: HttpClient) {}
  getUsers()               { return this.http.get<User[]>(`${this.base}/users`); }
  banUser(id: number)      { return this.http.post<User>(`${this.base}/users/${id}/ban`, {}); }
  unbanUser(id: number)    { return this.http.post<User>(`${this.base}/users/${id}/unban`, {}); }
  deleteUser(id: number)   { return this.http.delete<void>(`${this.base}/users/${id}`); }
  getPosts(page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Post>>(`${this.base}/posts`, { params });
  }
  hidePost(id: number)     { return this.http.post<Post>(`${this.base}/posts/${id}/hide`, {}); }
  unhidePost(id: number)   { return this.http.post<Post>(`${this.base}/posts/${id}/unhide`, {}); }
  deletePost(id: number)   { return this.http.delete<void>(`${this.base}/posts/${id}`); }
  getReports()             { return this.http.get<Report[]>(`${this.base}/reports`); }
  resolveReport(id: number, action: string) {
    const params = new HttpParams().set('action', action);
    return this.http.post<Report>(`${this.base}/reports/${id}/resolve`, {}, { params });
  }
}
