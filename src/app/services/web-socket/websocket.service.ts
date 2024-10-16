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
    this.connect();
  }

  connect(): void {
    this.isChatClosed = localStorage.getItem('isChatClosed') === 'true';
    
    if (this.isChatClosed) {
      console.log('Chat is closed. WebSocket connection not allowed.');
      return; // Prevent connection if chat is closed
    }

    this.socket = io('http://localhost:5000');

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    this.socket.on('connect_timeout', (timeout) => {
      console.warn('Connection timeout:', timeout);
    });

    this.socket.on('userCreated', (user) => {
      this.userCreatedSubject.next(user);
    });

    this.socket.connect();
  }

  joinRoom(userId: string, adminId: string): void {
    const room = `user_${userId}_admin_${adminId}`;
    this.socket.emit('joinRoom', { userId, adminId, room });
    console.log(`Joined room: ${room}`);
  }

  sendMessage(message: any, userId: string, adminId: string): void {
    if (!this.isChatClosed) {
      const room = `user_${userId}_admin_${adminId}`;
      this.socket.emit('sendMessage', { room, message });
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

  emitChatClosed(userId: string, adminId: string): void {
    const room = `user_${userId}_admin_${adminId}`;
    this.socket.emit('chatClosed', { room });
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
