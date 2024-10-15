// chat-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatStateService {
  private chatClosedSubject = new BehaviorSubject<boolean>(false); // Default value is false
  chatClosed$ = this.chatClosedSubject.asObservable();

  constructor() {}

  closeChat(): void {
    this.chatClosedSubject.next(true); // Notify subscribers that the chat is closed
  }

  openChat(): void {
    this.chatClosedSubject.next(false); // Notify subscribers that the chat is open
  }
}
