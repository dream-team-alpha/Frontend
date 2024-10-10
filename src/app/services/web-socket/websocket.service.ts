import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: Socket;

  // Create a Subject to handle incoming messages
  private messageSubject = new Subject<any>();
  public message$ = this.messageSubject.asObservable();

  constructor() {
    // Initialize the socket connection with the server URL
    this.socket = io('http://localhost:5000'); // Update with your server URL
  }

  // Method to connect to the WebSocket server
  connect(): void {
    this.socket.connect(); // Connect to the socket
  }

  // Method to send messages
  sendMessage(message: any): void {
    this.socket.emit('sendMessage', message); // Emit the message
  }

  // Subscribe to incoming messages
  receiveNewMessage() {
    this.socket.on('receiveMessage', (message) => {
      this.messageSubject.next(message); // Notify subscribers with the new message
    });
    return this.message$; // Return the observable
  }

  // Method to disconnect from the WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
