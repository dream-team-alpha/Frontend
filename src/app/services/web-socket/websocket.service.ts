import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { User } from 'src/app/components/home/user-chat-box/user-chat-box.component';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private globalSocket!: Socket;
  private userSockets: Map<string, Socket> = new Map();
  private messageSubject = new Subject<any>();
  public message$ = this.messageSubject.asObservable();
  private userCreatedSubject = new Subject<any>();
  public userCreated$ = this.userCreatedSubject.asObservable();
  private isChatClosed = false;

  constructor() {
    this.connectGlobalSocket();
  }

  connectGlobalSocket(): void {
    this.isChatClosed = localStorage.getItem('isChatClosed') === 'true';
    
    if (this.isChatClosed) {
      console.log('Chat is closed. WebSocket connection not allowed.');
      return; // Prevent connection if chat is closed
    }

    this.globalSocket = io('http://localhost:5000');

    this.globalSocket.on('connect_error', (error) => {
      console.error('Global socket connection error:', error);
    });

    this.globalSocket.on('connect_timeout', (timeout) => {
      console.warn('Global socket connection timeout:', timeout);
    });

    this.globalSocket.on('receiveMessage', (message) => {
      this.messageSubject.next(message);
    });

    this.globalSocket.on('userCreated', (user) => {
      this.userCreatedSubject.next(user);
    });

    this.globalSocket.connect()
  }

  connectUserSocket(userId: string, adminId: string): void {
    if (this.userSockets.has(userId)) {
      console.warn(`Socket already exists for user: ${userId}`);
      return; // Prevent duplicate connections
    }

    const userSocket = io('http://localhost:5000');
    this.userSockets.set(userId, userSocket);

    userSocket.on('connect', () => {
      console.log(`Connected to socket for user: ${userId}`);
      this.joinRoom(userId, adminId);
    });

    userSocket.on('connect_error', (error) => {
      console.error(`Connection error for user ${userId}:`, error);
    });

    userSocket.on('connect_timeout', (timeout) => {
      console.warn(`Connection timeout for user ${userId}:`, timeout);
    });

    userSocket.on('receiveMessage', (message) => {
      this.messageSubject.next(message);
    });

    // Handle disconnection
    userSocket.on('disconnect', () => {
      console.log(`Disconnected from socket for user: ${userId}`);
      this.userSockets.delete(userId); // Remove from active sockets
    });
  }


  joinRoom(userId: string, adminId: string): void {
    const room = `user_${userId}_admin_${adminId}`;
    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.emit('joinRoom', { userId, adminId, room });
      console.log(`Joined room: ${room}`);
    }
  }

  sendMessage(message: any, userId: string, adminId: string): void {
    if (!this.isChatClosed) {
      const room = `user_${userId}_admin_${adminId}`;
      if (this.userSockets.has(userId)) {
        this.userSockets.get(userId)!.emit('sendMessage', { room, message });
      } else {
        console.warn(`No socket found for user: ${userId}`);
      }
    } else {
      console.log('Cannot send message, chat is closed.');
    }
  }
  receiveNewMessage() {
    this.globalSocket.on('receiveMessage', (message) => {
      this.messageSubject.next(message);
    });
    return this.message$;
  }

  disconnectUserSocket(userId: string): void {
    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.disconnect();
      this.userSockets.delete(userId); // Remove from active sockets
    }
  }

  disconnectGlobalSocket(): void {
    if (this.globalSocket) {
      this.globalSocket.disconnect();
    }
  }

  emitChatClosed(userId: string, adminId: string): void {
    const room = `user_${userId}_admin_${adminId}`;
    this.globalSocket.emit('chatClosed', { room });
  }  

  setChatClosed(state: boolean): void {
    this.isChatClosed = state;
  }

  setSocketInstance(socketInstance: Socket) {
    this.globalSocket = socketInstance;
  }

  emitUserCreated(user: User) {
    this.globalSocket.emit('userCreated', user);
  }
}
