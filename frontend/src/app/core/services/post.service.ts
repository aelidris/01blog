import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Post, Page } from '../models/post.model';
import { Comment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getFeed(page = 0, size = 10) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Post>>(`${this.base}/posts/feed`, { params });
  }
  getUserPosts(userId: number, page = 0, size = 10) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Post>>(`${this.base}/posts/user/${userId}`, { params });
  }
  getPost(id: number)        { return this.http.get<Post>(`${this.base}/posts/${id}`); }
  createPost(fd: FormData)   { return this.http.post<Post>(`${this.base}/posts`, fd); }
  updatePost(id: number, fd: FormData) { return this.http.put<Post>(`${this.base}/posts/${id}`, fd); }
  deletePost(id: number)     { return this.http.delete<void>(`${this.base}/posts/${id}`); }
  toggleLike(id: number)     { return this.http.post<Post>(`${this.base}/posts/${id}/like`, {}); }
  addComment(id: number, content: string) {
    return this.http.post<Comment>(`${this.base}/posts/${id}/comments`, { content });
  }
  deleteComment(id: number)  { return this.http.delete<void>(`${this.base}/posts/comments/${id}`); }
}
