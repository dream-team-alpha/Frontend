import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent{

  constructor() { }

  ngOnInit(): void {
  }
  @Input() title: string = '';
  @Input() isOpen: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() confirmEvent = new EventEmitter<void>();

  close(): void {
    this.isOpen = false;
    this.closeEvent.emit();
  }

  confirm(): void {
    this.confirmEvent.emit();
    this.close();
  }

}
