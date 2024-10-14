import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { User } from 'src/app/components/home/user-chat-box/user-chat-box.component';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: Socket;
  private messageSubject = new Subject<any>();
  public message$ = this.messageSubject.asObservable();
  private userCreatedSubject = new Subject<any>();
  public userCreated$ = this.userCreatedSubject.asObservable();
  private isChatClosed = false;

  constructor() {
    this.connect()
  }

  connect(): void {
    this.socket = io('http://localhost:5000');

    this.isChatClosed = localStorage.getItem('isChatClosed') === 'true';

    this.socket.on('userCreated', (user) => {
      this.userCreatedSubject.next(user);
    });

    if (this.isChatClosed) {
      console.log('Chat is closed. WebSocket connection not allowed.');
      this.socket.disconnect();
      return;
    }

    this.socket.connect();
  }

  sendMessage(message: any): void {
    if (!this.isChatClosed) {
      this.socket.emit('sendMessage', message);
    } else {
      console.log('Cannot send message, chat is closed.');
    }
  }

  receiveNewMessage() {
    this.socket.on('receiveMessage', (message) => {
      this.messageSubject.next(message);
    });
    return this.message$;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  setChatClosed(state: boolean): void {
    this.isChatClosed = state;
  }

  setSocketInstance(socketInstance: Socket) {
    this.socket = socketInstance;
  }
  emitUserCreated(user: User) {
    this.socket.emit('userCreated', user);
  }
}
