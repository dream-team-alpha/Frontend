import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatStateService {
  private chatClosedSource = new BehaviorSubject<boolean>(false);
  chatClosed$ = this.chatClosedSource.asObservable();

  setChatClosed(state: boolean): void {
    this.chatClosedSource.next(state);
  }
}
