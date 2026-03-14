import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getMe()                     { return this.http.get<User>(`${this.base}/users/me`); }
  updateProfile(bio: string)  { return this.http.put<User>(`${this.base}/users/me`, { bio }); }
  updateAvatar(f: FormData)   { return this.http.post<User>(`${this.base}/users/me/avatar`, f); }
  getUser(id: number)         { return this.http.get<User>(`${this.base}/users/${id}`); }
  getBlock(username: string)  { return this.http.get<User>(`${this.base}/users/username/${username}/block`); }
  subscribe(id: number)       { return this.http.post<void>(`${this.base}/users/${id}/subscribe`, {}); }
  unsubscribe(id: number)     { return this.http.delete<void>(`${this.base}/users/${id}/subscribe`); }
  getSubscribers(id: number)  { return this.http.get<User[]>(`${this.base}/users/${id}/subscribers`); }
  getSubscriptions(id: number){ return this.http.get<User[]>(`${this.base}/users/${id}/subscriptions`); }

  browseUsers()               { return this.http.get<User[]>(`${this.base}/users/explore`); }
  searchUsers(q: string)      {
    const params = new HttpParams().set('q', q);
    return this.http.get<User[]>(`${this.base}/users/search`, { params });
  }

  getNotifications()          { return this.http.get<Notification[]>(`${this.base}/users/me/notifications`); }
  getUnreadCount()            { return this.http.get<{count: number}>(`${this.base}/users/me/notifications/unread-count`); }
  markAllRead()               { return this.http.post<void>(`${this.base}/users/me/notifications/read`, {}); }
}
