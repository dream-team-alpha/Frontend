import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  senderType: 'admin' | 'user';
  receiverType: 'admin' | 'user';
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket;
  private newMessageSubject = new Subject<Message>();

  constructor() {
    this.socket = io('http://localhost:5000'); // Adjust the URL

    this.socket.on('receiveMessage', (message: Message) => {
      console.log('Message received from server:', message); 
      this.newMessageSubject.next(message);
    });

    this.socket.on('joinConfirmation', (userId: number) => {
      console.log(`User ${userId} successfully joined the room`);
    });

    this.socket.on('disconnect', () => {
      console.warn('Socket disconnected');
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });
  }

  connect(userId: number): void {
    console.log(`Connecting with user ID: ${userId}`);
    this.socket.emit('join', userId);

    this.socket.on('joinConfirmation', (userId: number) => {
      console.log(`User ${userId} has successfully joined the room`);
    });
  }

  sendMessage(message: Message): void {
    console.log('Sending message:', message);
    this.socket.emit('sendMessage', message);
  }

  receiveNewMessage() {
    return this.newMessageSubject.asObservable();
    
  }
}
