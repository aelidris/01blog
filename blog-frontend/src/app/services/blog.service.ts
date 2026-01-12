import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  // This matches your @RequestMapping in Spring Boot
  private apiUrl = 'http://localhost:8080/api/posts/test';

  constructor(private http: HttpClient) { }

  getTestMessage(): Observable<{message: string}> {
    return this.http.get<{message: string}>(this.apiUrl);
  }
}