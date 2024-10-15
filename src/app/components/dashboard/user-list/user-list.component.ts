import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { WebSocketService } from 'src/app/services/web-socket/websocket.service';
import { Subscription } from 'rxjs';

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
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  @Input() searchText: string = '';
  @Output() userSelected = new EventEmitter<User>(); 

  selectedUserId: number | null = null; // Track the selected user
  private userCreatedSubscription!: Subscription;

  constructor(private userService: UserService, private router: Router, private webSocketService: WebSocketService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.subscribeToUserCreation();
  }

  ngOnDestroy(): void {
    if (this.userCreatedSubscription) {
      this.userCreatedSubscription.unsubscribe();
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((data: User[]) => {
      this.users = data;
    });
  }

  openChat(userId: number): void {
    this.selectedUserId = userId; // Set selected user
    this.router.navigate([`/support-team-admin-dashboard/chat/${userId}`]);
  }

  selectUser(user: User): void {
    this.userSelected.emit(user);
  }

  private subscribeToUserCreation(): void {
    this.userCreatedSubscription = this.webSocketService.userCreated$.subscribe(
      (user: User) => {
        console.log('New user created:', user);
        const userExists = this.users.some(
          (existingUser) => existingUser.id === user.id
        );
        if (!userExists) {
          this.users.unshift(user);
        }
      }
    );
  }

  get filteredUsers() {
    return this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
