import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs'; // 1. Added 'tap' here
import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth/register';
  private loginUrl = 'http://localhost:8080/api/auth/login';
  private postsUrl = 'http://localhost:8080/api/posts'; // 2. Corrected port to 8080

  private currentUser: any = null; // Stores the logged-in user session

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData, { responseType: 'text' });
  }

  login(userData: any): Observable<any> {
    return this.http.post(this.loginUrl, userData, { responseType: 'text' }).pipe(
      tap(response => {
        if (response === "Login successful!") {
          this.currentUser = userData; // 3. Save user info on success
          console.log("Session started for:", this.currentUser.username);
        }
      })
    );
  }

  // 4. Added helper to get the current user in other components
  getCurrentUser() {
    return this.currentUser;
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.postsUrl, post);
  }

  getPosts(): Observable<Post[]> {
  return this.http.get<Post[]>('http://localhost:8080/api/posts');
}
}