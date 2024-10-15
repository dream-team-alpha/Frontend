import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Message } from 'src/app/components/home/user-chat-box/user-chat-box.component';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient, private authService:AuthService) {}

  getUserMessages(userId: number, adminId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/api/messages/history/${userId}/${adminId}`, { headers });
  }

  sendMessage(message: Message): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/messages/send`, message);
  }
  submitFeedback(feedbackData: any) {
    return this.http.post(`${this.apiUrl}/api/feedback/submit`, feedbackData);
  }
  
}
