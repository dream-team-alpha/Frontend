import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = true; // To show loading state
  adminId!: string | null;
  errorMessage: string | null = null;
  isModalOpen = false; // To control modal visibility

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.adminId = this.authService.getUserId(false); // Get admin ID
    if (!this.adminId) {
      this.router.navigate(['/support-team-admin-login']); // Redirect if no ID found
      return;
    }

    this.initProfileForm();
    this.loadProfile();
  }

  initProfileForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      avatar: [null] // Optional avatar file
    });
  }

  loadProfile(): void {
    if (this.adminId) {
      this.authService.getAdminProfile(this.adminId).subscribe(
        profile => {
          this.profileForm.patchValue(profile); // Populate the form with profile data
          this.isLoading = false; // Stop loading
        },
        error => {
          this.errorMessage = error; // Handle error
          this.isLoading = false; // Stop loading
        }
      );
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.profileForm.patchValue({
        avatar: file // Assign the file to the form control
      });
    }
  }

  // Open confirmation modal
  openModal(): void {
    this.isModalOpen = true;
  }

  // Close confirmation modal
  closeModal(): void {
    this.isModalOpen = false;
  }

  // Confirm update profile
  confirmUpdate(): void {
    if (this.profileForm.valid) {
      const formData = new FormData();
      Object.keys(this.profileForm.value).forEach(key => {
        formData.append(key, this.profileForm.value[key]);
      });

      this.authService.updateAdminProfile(Number(this.adminId), formData).subscribe(
        response => {
          this.closeModal(); // Close modal after successful update
          this.router.navigate(['/support-team-admin-dashboard']); // Redirect after successful update
        },
        error => {
          this.errorMessage = error; // Handle error
        }
      );
    }
  }

  // Prevent direct form submission
  onSubmit(): void {
    this.openModal(); // Open modal instead of directly submitting the form
  }
}
