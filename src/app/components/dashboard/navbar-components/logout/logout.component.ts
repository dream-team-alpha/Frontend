import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class LogoutComponent implements OnInit {
  constructor(private dialogRef: MatDialogRef<LogoutComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true); // Confirm logout
  }

  onCancel(): void {
    this.dialogRef.close(false); // Cancel logout
  }

  ngOnInit(): void {}
}
