import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api/messages';

  constructor(private http: HttpClient, private authService:AuthService) {}

  getUserMessages(userId: number, adminId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/history/${userId}/${adminId}`, { headers });
  }

  sendMessage(message: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, message);
  }
}
