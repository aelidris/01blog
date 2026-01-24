import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs'; // 1. Added 'tap' here
import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = 'http://localhost:8080/api/auth';
  private postsUrl = 'http://localhost:8080/api/posts';
  private usersUrl = 'http://localhost:8080/api/posts'; // New base for follow/unfollow

  private currentUser: any = null;

  constructor(private http: HttpClient) { }

  

  // Update this method to use the correct usersUrl
  followUser(targetUsername: string, currentUsername: string): Observable<any> {
    const params = new HttpParams().set('currentUsername', currentUsername);
    // This will now point to: http://localhost:8080/api/users/{targetUsername}/follow
    return this.http.post(`${this.usersUrl}/${targetUsername}/follow`, {}, { params, responseType: 'text' });
  }

  // Update register/login to use authUrl
  register(userData: any): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, userData, { responseType: 'text' });
  }

 login(userData: any): Observable<any> {
  return this.http.post(`${this.authUrl}/login`, userData, { responseType: 'text' }).pipe(
    tap(response => {
      if (response === "Login successful!") {
        this.currentUser = userData;
        // Keep the user logged in even if they refresh the page
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
    })
  );
}

getCurrentUser() {
  // If the variable is empty, try to get it from the browser's storage
  if (!this.currentUser) {
    const data = localStorage.getItem('currentUser');
    if (data) this.currentUser = JSON.parse(data);
  }
  return this.currentUser;
}

// Add this inside the AuthService class in auth.service.ts
logout() {
  this.currentUser = null; // Clears the variable in memory
  localStorage.removeItem('currentUser'); // Clears the saved session
}

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.postsUrl, post);
  }

  uploadPost(formData: FormData) {
  return this.http.post('http://localhost:8080/api/posts/upload', formData);
}

  getPosts(): Observable<Post[]> {
  return this.http.get<Post[]>('http://localhost:8080/api/posts');
}

// Ensure this is also here for your loadPosts() to work
  getFollowedPosts(username: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/posts/feed/${username}`);
  }

// 1. Updated to match @GetMapping("/following/{username}")
getUserFollowing(username: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.usersUrl}/following/${username}`);
}

// 2. Updated to match @PostMapping("/{username}/unfollow")
unfollowUser(targetUsername: string, currentUsername: string): Observable<any> {
  const params = new HttpParams().set('currentUsername', currentUsername);
  return this.http.post(`${this.usersUrl}/${targetUsername}/unfollow`, {}, { params, responseType: 'text' });
}

}