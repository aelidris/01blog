import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth/register';

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData, { responseType: 'text' });
  }

  private loginUrl = 'http://localhost:8080/api/auth/login';
  login(userData: any): Observable<any> {
    return this.http.post(this.loginUrl, userData, { responseType: 'text' });
   }
}