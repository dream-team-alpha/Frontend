import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router'; // Import Router
import { LogoutComponent } from '../navbar-components/logout/logout.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false; // Track menu state

  constructor(private dialog: MatDialog, private router: Router) {} // Inject Router

  ngOnInit(): void {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen; // Toggle menu state
    const menu = document.querySelector('.navbar-menu');
    if (menu) {
      menu.classList.toggle('active', this.isMenuOpen); // Add active class
    }
  }

  openLogoutDialog() {
    const dialogRef = this.dialog.open(LogoutComponent); // Open Logout dialog

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.logout(); // Perform logout if confirmed
      }
    });
  }

  logout() {
    localStorage.clear(); // Remove token from local storage
    console.log('User logged out');
    this.router.navigate(['/support-team-admin-login']); // Redirect to login page
  }
}
