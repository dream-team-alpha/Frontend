import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SubAdminService } from 'src/app/services/sub-admin/sub-admin.service';

@Component({
  selector: 'app-manage-sub-admins',
  templateUrl: './manage-sub-admins.component.html',
  styleUrls: ['./manage-sub-admins.component.css']
})
export class ManageSubAdminsComponent implements OnInit {
  subAdmins: any[] = [];
  subAdminForm: FormGroup;
  filteredSubAdmins: any[] = [];
  searchTerm: string = '';
  selectedAvatar: string | ArrayBuffer | null = null; // Variable to hold the avatar preview
  isEditMode: boolean = false;
  selectedSubAdmin: any;
  currentPage: number = 1;
  totalPagesArray: number[] = [];
  totalPages: number = 1; 
  isModalOpen: boolean = false; 
  isDeleteConfirmationOpen: boolean = false; 
  showPassword: boolean = false; // Toggle for password visibility
  showPasswordConfirmation: boolean = false; // Toggle for password confirmation visibility

  constructor(
    private fb: FormBuilder,
    private subAdminService: SubAdminService,
  ) {
    this.subAdminForm = this.fb.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // Make optional for edit mode
      passwordConfirmation: [''], // Make optional for edit mode
      avatar: [null] // New field for avatar
  }, { validators: this.passwordsMatch }); // Custom validator here
   // Pass current isEditMode
  }
  
  

  ngOnInit(): void {
    this.loadSubAdmins();
  }

  loadSubAdmins(): void {
    this.subAdminService.getSubAdmins().subscribe((subAdmins) => {
      this.subAdmins = subAdmins.map(subAdmin => {
        return {
          ...subAdmin,
          avatar: `http://localhost:5000/${subAdmin.avatar}`
        };
      });
      this.filteredSubAdmins = [...this.subAdmins];
      this.calculatePagination();
    });
  }

  filterSubAdmins(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredSubAdmins = this.subAdmins.filter(subAdmin => {
      const fullName = `${subAdmin.firstName} ${subAdmin.lastName}`.toLowerCase();
      const email = subAdmin.email.toLowerCase();
      return fullName.includes(searchTermLower) || email.includes(searchTermLower);
    });
    this.calculatePagination(); // Recalculate pagination after filtering
  }

  calculatePagination(): void {
    const pageSize = 10; 
    this.totalPages = Math.ceil(this.subAdmins.length / pageSize);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updateSubAdminsForCurrentPage();
  }

  updateSubAdminsForCurrentPage(): void {
    const pageSize = 10;
    const startIndex = (this.currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    this.subAdmins = this.subAdmins.slice(startIndex, endIndex);
  }

  openAddSubAdminModal(): void {
    console.log('Opening Add Sub-Admin Modal');
    this.isEditMode = false;
    this.subAdminForm.reset();
    this.isModalOpen = true; 
  }

  closeModal(): void {
    this.isModalOpen = false; 
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      
      // Read the file and set it as the selected avatar
      reader.onload = () => {
        this.selectedAvatar = reader.result; // Set the selected avatar for preview
      };
      reader.readAsDataURL(file); // Convert the file to a data URL
      this.subAdminForm.patchValue({ avatar: file }); // Save the file to the form
    }
  }

  addSubAdmin(): void {
    // Ensure passwords are matched if provided
    this.subAdminForm.setValidators(this.passwordsMatch);
    this.subAdminForm.updateValueAndValidity();
  
    // Check form validity
    if (this.subAdminForm.valid) {
        const formData = new FormData(); // Create a new FormData object

        // Append all form fields to the FormData object
        formData.append('firstName', this.subAdminForm.value.firstName);
        formData.append('lastName', this.subAdminForm.value.lastName);
        formData.append('email', this.subAdminForm.value.email);

        // Append the avatar file if it exists
        const avatarFile = this.subAdminForm.get('avatar')?.value;
        if (avatarFile) {
            formData.append('avatar', avatarFile, avatarFile.name); // Optional: include the filename
        } else {
            console.warn('No avatar file selected.'); // Log a warning if no file was provided
        }

        // Append passwords to the FormData
        formData.append('password', this.subAdminForm.value.password);
        formData.append('passwordConfirmation', this.subAdminForm.value.passwordConfirmation);

        this.subAdminService.addSubAdmin(formData).subscribe({
            next: () => {
                this.loadSubAdmins();
                this.closeModal();
            },
            error: (err) => {
                console.error('Error adding sub-admin:', err);
                alert('An error occurred while adding the sub-admin. Please try again.');
            }
        });
    } else {
        console.error('Form is invalid', this.subAdminForm.errors);
        alert('Please ensure all fields are filled out correctly, especially the email.');
    }
} 

  openEditSubAdminModal(subAdmin: any): void {
    this.isEditMode = true;
    this.selectedSubAdmin = subAdmin;
  
    // Initialize the form with existing data except the password fields
    this.subAdminForm.patchValue({
      id: subAdmin.id, // Ensure this is correctly set
      firstName: subAdmin.firstName,
      lastName: subAdmin.lastName,
      email: subAdmin.email,
      avatar: null // Allow for a new avatar upload, but don't overwrite existing avatar here
    });
  
    // Set current avatar preview if available
    this.selectedAvatar = subAdmin.avatar || null;
  
    // Set validators for password matching
    this.subAdminForm.setValidators(this.passwordsMatch);
    this.subAdminForm.updateValueAndValidity();
  
    this.isModalOpen = true;
  }
  

  updateSubAdmin(): void {
    // Log the selected sub-admin to verify the id is present
    console.log('Updating sub-admin:', this.selectedSubAdmin);
  
    // Validate form
    if (!this.selectedSubAdmin || !this.selectedSubAdmin.id) {
      console.error('No sub-admin selected or ID is missing.');
      return; // Exit early if there is no valid id
    }
  
    const formData = new FormData();
    formData.append('id', this.selectedSubAdmin.id); // Ensure the ID is correctly appended
    formData.append('firstName', this.subAdminForm.value.firstName);
    formData.append('lastName', this.subAdminForm.value.lastName);
    formData.append('email', this.subAdminForm.value.email);
  
    // Handle avatar update
    const avatarFile = this.subAdminForm.get('avatar')?.value;
    if (avatarFile) {
      formData.append('avatar', avatarFile); // Include new avatar if available
    }
  
    // Send update request
    this.subAdminService.updateSubAdmin(formData).subscribe({
      next: () => {
        this.loadSubAdmins(); // Refresh the list of sub-admins
        this.closeModal();
      },
      error: (err) => {
        console.error('Error updating sub-admin:', err);
      }
    });
  }
  

  confirmDelete(id: string): void {
    this.selectedSubAdmin = { id }; 
    this.isDeleteConfirmationOpen = true; 
  }

  closeDeleteConfirmationModal(): void {
    this.isDeleteConfirmationOpen = false; 
  }

  deleteSubAdmin(id: string): void {
    this.subAdminService.deleteSubAdmin(Number(id)).subscribe({
      next: () => {
        this.loadSubAdmins(); 
        this.closeDeleteConfirmationModal(); 
      },
      error: (err) => {
        console.error('Error deleting sub-admin:', err);
      }
    });
  }

  // Password visibility toggle
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  togglePasswordConfirmationVisibility(): void {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }

// Custom validator to check if passwords match
passwordsMatch: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  // Cast the control to a FormGroup
  const formGroup = control as FormGroup;

  const password = formGroup.get('password')?.value;
  const passwordConfirmation = formGroup.get('passwordConfirmation')?.value;

  // If in edit mode and passwords are empty, skip validation
  if (this.isEditMode && (!password && !passwordConfirmation)) {
      return null; // Do not validate if both are empty
  }

  return password === passwordConfirmation ? null : { passwordsMismatch: true };
}




  // Pagination methods
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSubAdmins();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSubAdmins();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadSubAdmins();
  }
}
