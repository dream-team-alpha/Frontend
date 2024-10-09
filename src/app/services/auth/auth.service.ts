import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface LoginCredentials {
  username: string;
  password: string;
}

interface SubAdminCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  // Store Token and IDs in LocalStorage
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setUserId(userId: string, isSubAdmin: boolean): void {
    const key = isSubAdmin ? 'subAdminId' : 'adminId';
    localStorage.setItem(key, userId);
  }

  getUserId(isSubAdmin: boolean): string | null {
    const key = isSubAdmin ? 'subAdminId' : 'adminId';
    return localStorage.getItem(key);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('adminId');
    localStorage.removeItem('subAdminId');
    this.router.navigate(['/home']);
  }

  // Error Handler
  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error instanceof ErrorEvent 
      ? `Error: ${error.error.message}` 
      : `Error: ${error.message}`;
    return throwError(errorMessage);
  }

  // Admin Signup
  signupAdmin(adminData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/admin/signup`, adminData, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(catchError(this.handleError));
  }

  // Admin Login
  loginAdmin(credentials: LoginCredentials): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/admin/login`, credentials, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError),
      tap(response => {
        if (response.token) this.setToken(response.token);
        if (response.admin?.id) {
          this.setUserId(response.admin.id.toString(), false);
        } else {
          console.error('adminId not found in response:', response);
        }
      })
    );
  }

  // Get Admin Profile
  getAdminProfile(adminId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/admin/profile/${adminId}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    }).pipe(catchError(this.handleError));
  }

  // Update Admin Profile
  updateAdminProfile(adminId: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/admin/profile/${adminId}`, formData, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    }).pipe(catchError(this.handleError));
  }

  // Sub-Admin Login
  loginSubAdmin(credentials: SubAdminCredentials): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/subadmin/login`, credentials, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(catchError(this.handleError));
  }

  // Get Sub-Admin Profile
  getSubAdminProfile(subAdminId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/subadmin/${subAdminId}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    }).pipe(catchError(this.handleError));
  }

  // Update Sub-Admin Profile
  updateSubAdminProfile(subAdminId: string, profileData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/subadmin/${subAdminId}`, profileData, {
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${this.getToken()}` 
      }
    }).pipe(catchError(this.handleError));
  }
}
