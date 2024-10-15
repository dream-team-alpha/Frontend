import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() userSelected = new EventEmitter<User>(); 
  searchText: string = '';

  adminId: string = localStorage.getItem('adminId') || '';
  adminName: string = ''; 
  adminAvatar: string = ''; // Variable to hold the avatar URL

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.getAdminProfile(this.adminId);
  }

  private getAdminProfile(adminId: string): void {
    this.authService.getAdminProfile(adminId).subscribe(
      (profile) => {
        this.adminName = `${profile.firstName} ${profile.lastName}`; // Set the admin's name
        this.adminAvatar = `http://localhost:5000${profile.avatar}`; // Construct avatar URL
      },
      (error) => {
        console.error('Error fetching admin profile:', error);
      }
    );
  }

  onUserSelected(user: User): void {
    this.userSelected.emit(user);
    this.router.navigate([`/support-team-admin-dashboard/chat/${user.id}`]);
  }
}
