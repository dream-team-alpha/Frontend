import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Message } from 'src/app/components/home/user-chat-box/user-chat-box.component';


@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: Socket;  // The WebSocket connection

  constructor() {}

  // Method to connect to the WebSocket server, providing a user ID
  connect(userId: number): void {
    this.socket = io(environment.apiUrl, {
      query: { userId: userId.toString() },  // Pass userId to server
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  // Send a message via WebSocket
  sendMessage(message: Message): void {
    this.socket.emit('sendMessage', message);
  }

  // Receive new messages as an Observable
  receiveNewMessage(): Observable<Message> {
    return new Observable<Message>((observer) => {
      this.socket.on('receiveMessage', (message: Message) => {
        observer.next(message);
      });

      return () => {
        this.socket.off('receiveMessage');
      };
    });
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
