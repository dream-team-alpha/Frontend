import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/services/user/user.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Output() userSelected = new EventEmitter<User>(); 
  isDropdownOpen: boolean = false;
  searchText: string = '';
  selectedUser: User | null = null;
   

  onUserSelected(user: User): void {
    this.selectedUser = user;
    this.userSelected.emit(user); // Emit the selected user
  }
  
  // Additional logic for dropdown and other sidebar actions
}
