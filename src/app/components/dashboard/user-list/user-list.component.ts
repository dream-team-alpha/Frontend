import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  @Input() searchText: string = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((data: User[]) => {
      this.users = data;
    });
  }

  openChat(userId: number): void {
    // Navigate to the chat route with the user's ID
    this.router.navigate([`/support-team-admin-dashboard/chat/${userId}`]);
  }

  // Filter users based on the search text
  get filteredUsers() {
    return this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
