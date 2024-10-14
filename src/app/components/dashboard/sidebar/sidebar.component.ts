import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Output() userSelected = new EventEmitter<User>(); 
  searchText: string = '';

  constructor(private router: Router) {}

  onUserSelected(user: User): void {
    this.userSelected.emit(user);
    this.router.navigate([`/support-team-admin-dashboard/chat/${user.id}`]);
  }
}
