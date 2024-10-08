import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  @Input() profile: { name?: string; email?: string; about?: string; avatar?: string } = {}; 
  isEditing = false;
  @Output() closeProfile = new EventEmitter<void>();

  goBack() {
    this.closeProfile.emit(); 
  }

  saveProfile() {
    console.log('Profile saved:', this.profile);
    this.isEditing = false;
  }
}
