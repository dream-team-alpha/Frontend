// sub-admin-login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-sub-admin-login',
  templateUrl: './sub-admin-login.component.html',
  styleUrls: ['./sub-admin-login.component.css']
})
export class SubAdminLoginComponent {
  email: string = '';
  password: string = '';
  loginError: boolean = false; // Add the loginError property to track errors

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    const credentials = { email: this.email, password: this.password }; // Use email for sub-admin
    this.authService.loginSubAdmin(credentials).subscribe(
      (response) => {
        this.authService.setToken(response.token);
        this.authService.setUserId(response.subAdmin.id, true); // Save the sub-admin ID
        this.loginError = false;
        this.router.navigate(['/sub-admin-dashboard']);
      },
      (error) => {
        console.error('Login failed', error);
        this.loginError = true;
      }
    );
  }
  
  
}
