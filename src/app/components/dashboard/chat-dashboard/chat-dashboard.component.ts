import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/services/chat/chat.service';
import { WebSocketService } from 'src/app/services/web-socket/websocket.service';
import { Message } from 'src/app/components/home/user-chat-box/user-chat-box.component'; // Adjust this path based on your project structure
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-dashboard',
  templateUrl: './chat-dashboard.component.html',
  styleUrls: ['./chat-dashboard.component.css']
})
export class ChatDashboardComponent implements OnInit, OnDestroy {
  userId!: string; // Keep this as a string to retrieve from route
  adminId: string = '3'; // Admin ID is a string for consistency with messages
  messages: Message[] = []; // Define messages using the Message interface
  newMessageContent: string = ''; // Variable to hold the content of the new message
  newMessageSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    // Subscribe to the route parameters to detect changes
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id')!; // Ensure you retrieve as a string
      this.loadMessages(); // Fetch messages for the new user ID
      this.webSocketService.connect(Number(this.userId)); // Connect to WebSocket with user ID

      // Subscribe to incoming messages from WebSocket
      this.newMessageSubscription = this.webSocketService.receiveNewMessage().subscribe((message) => {
        console.log('New message received:', message); // Log incoming messages
        if (!this.isMessageDuplicate(message)) {
          this.messages.push(message); // Push received messages into the messages array
        }
      });
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe on component destruction
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
    }
  }

  loadMessages(): void {
    const userIdNum = Number(this.userId);
    const adminIdNum = Number(this.adminId);
    this.chatService.getUserMessages(userIdNum, adminIdNum).subscribe((data: Message[]) => {
      this.messages = data; // Store the messages
    });
  }

  // Method to send a new message
  sendMessage(): void {
    if (this.newMessageContent.trim() !== '') {
      const message: Message = {
        content: this.newMessageContent,
        senderId: this.adminId, // Now senderId is the admin ID
        receiverId: this.userId, // Now receiverId is the user ID
        senderType: 'admin', // The sender type is now admin
        receiverType: 'user', // The receiver type is now user
        createdAt: new Date().toISOString(), // Ensure correct timestamp
      };

      this.webSocketService.sendMessage(message); // Use Socket.IO to send message
      this.messages.push(message); // Push the newly sent message into the messages array
      this.newMessageContent = ''; // Clear the input field
    }
  }

  private isMessageDuplicate(newMessage: Message): boolean {
    return this.messages.some(
      (msg) =>
        msg.content === newMessage.content &&
        msg.senderId === newMessage.senderId &&
        msg.receiverId === newMessage.receiverId
    );
  }
}
