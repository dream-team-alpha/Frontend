import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
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

  private apiUrl = environment.apiUrl; // API URL from the environment config


  constructor(private http: HttpClient) { }

  // Store Token in LocalStorage
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Get Token from LocalStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setAdminId(adminId: string): void {
    localStorage.setItem('adminId', adminId);
  }

  // Get Admin ID from LocalStorage
  getAdminId(): string | null {
    return localStorage.getItem('adminId');
  }

  // Set Admin or Sub-Admin ID in LocalStorage
  setUserId(userId: string, isSubAdmin: boolean): void {
    const key = isSubAdmin ? 'subAdminId' : 'adminId';
    localStorage.setItem(key, userId);
  }

  // Get Admin or Sub-Admin ID from LocalStorage
  getUserId(isSubAdmin: boolean): string | null {
    const key = isSubAdmin ? 'subAdminId' : 'adminId';
    return localStorage.getItem(key);
  }

  // Admin Login
  loginAdmin(credentials: LoginCredentials): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
  
    return this.http.post<any>(`${this.apiUrl}/api/admin/login`, credentials, { headers })
      .pipe(
        catchError(this.handleError),
        tap(response => {
          console.log('Login Response:', response); // Log the entire response for debugging
  
          // Store the token
          if (response.token) {
            this.setToken(response.token);
          }
  
          // Store adminId
          if (response.admin && response.admin.id) {
            this.setUserId(response.admin.id.toString(), false); // Store adminId
            console.log('Stored adminId:', response.admin.id); // Log the stored adminId
          } else {
            console.error('adminId not found in response:', response); // Log error if adminId not found
          }
        })
      );
  }


  // Sub-Admin Login
  loginSubAdmin(credentials: SubAdminCredentials): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.apiUrl}/api/subadmin/login`, credentials, { headers })
      .pipe(catchError(this.handleError));
  }


  // Check if the admin is Logged In (based on token)
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Error: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
