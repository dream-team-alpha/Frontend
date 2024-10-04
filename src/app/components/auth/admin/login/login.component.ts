import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import validateForm from 'src/app/helpers/validateForm';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  type: string = 'password';
  isText: boolean = false;
  isIcon: string = "fa fa-eye-slash";
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  hideShowPass() {
    this.isText = !this.isText;
    this.isIcon = this.isText ? 'fa fa-eye' : 'fa fa-eye-slash';
    this.type = this.isText ? "text" : "password";
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.loginAdmin(this.loginForm.value).subscribe(
        (response: any) => {
          // Store JWT token in localStorage
          if (response.token) {
            localStorage.setItem('token', response.token);
          }

          // Store adminId in localStorage
          if (response.admin && response.admin.id) {
            localStorage.setItem('adminId', response.admin.id.toString());
            console.log('Stored adminId:', response.admin.id); // Log the stored adminId
          } else {
            console.error('adminId not found in response:', response); // Log error if adminId not found
          }

          // Redirect to the dashboard or protected page
          this.router.navigate(['/support-team-admin-dashbboard']);
        },
        (error: any) => {
          console.error('Login failed', error);
        }
      );
    } else {
      validateForm.validateAllFormFields(this.loginForm);
      alert("Your form is invalid");
    }
  }
}
