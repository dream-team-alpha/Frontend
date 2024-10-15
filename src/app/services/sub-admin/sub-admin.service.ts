import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubAdmin } from 'src/app/models/sub-admin-profile/sub-admin.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubAdminService {
  private apiUrl = `${environment.apiUrl}/api/subadmin`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Adjust this key if your token is stored under a different name
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // Use the Bearer token scheme
    });
  }

  addSubAdmin(subAdmin: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, subAdmin, { headers: this.getHeaders() });
  }

  updateSubAdmin(formData: FormData): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${formData.get('id')}`, 
      formData, 
      { headers: this.getHeaders() } // Include headers with the token
    );
  }
  
  deleteSubAdmin(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }  

  getSubAdmins(): Observable<SubAdmin[]> {
    return this.http.get<SubAdmin[]>(`${this.apiUrl}`, { headers: this.getHeaders() }); // Pass the headers with the request
  }
}
