import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/services/chat/chat.service';
import { UserService } from 'src/app/services/user/user.service';
import { WebSocketService } from 'src/app/services/web-socket/websocket.service';

export interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  senderType: 'admin' | 'user';
  receiverType: 'admin' | 'user';
  createdAt: string;
}

@Component({
  selector: 'app-user-chat-box',
  templateUrl: './user-chat-box.component.html',
  styleUrls: ['./user-chat-box.component.css'],
})
export class UserChatBoxComponent implements OnInit, OnDestroy {
  name: string = '';
  email: string = '';
  message: string = '';
  messages: Message[] = [];
  isChatOpen = false;
  isDetailsSubmitted = false;
  userId: string = '';
  adminId: number = 3; // Admin ID fixed
  private newMessageSubscription!: Subscription;

  constructor(
    private userService: UserService,
    private webSocketService: WebSocketService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
    this.loadMessages();

    if (this.isDetailsSubmitted) {
      this.webSocketService.connect();
      this.subscribeToNewMessages(); // Subscribe to new messages if details are submitted
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from the message stream to prevent memory leaks
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
    }
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen; // Toggle chat box open state
    if (this.isChatOpen) {
      this.scrollToBottom(); // Scroll to the bottom when chat box is opened
    }
  }
  
  isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return regex.test(email);
  }

  submitUserDetails(): void {
    if (this.name.trim() === '' || this.email.trim() === '') {
      console.error('Name and Email are required');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      console.error('Email must be a valid Gmail address');
      return;
    }

    // Call service to create user
    this.userService.createUser(this.name, this.email).subscribe(
      (response: any) => {
        this.userId = response.id; // Assume response contains the user ID
        this.isDetailsSubmitted = true;

        // Save user details to storage
        this.saveUserDetails();

        // Connect to Socket.IO after details are submitted
        this.webSocketService.connect();
        this.subscribeToNewMessages(); // Subscribe to incoming messages
      },
      (error) => {
        console.error('Error creating user:', error);
      }
    );
  }

  private subscribeToNewMessages(): void {
    // Subscribe to incoming messages only once
    if (!this.newMessageSubscription) {
      this.newMessageSubscription = this.webSocketService.receiveNewMessage().subscribe((message: Message) => {
        if (!this.isMessageDuplicate(message)) {
          this.messages.push(message);
          this.scrollToBottom(); // Scroll to bottom when receiving message
          this.updateMessageCache(); // Update messages in storage
        }
      });
    }
  }

  sendMessage(): void {
    if (this.message.trim() === '') return; // Avoid sending empty messages

    const messageData: Message = {
      senderId: this.userId,
      receiverId: this.adminId.toString(),
      content: this.message,
      senderType: 'user',
      receiverType: 'admin',
      createdAt: new Date().toISOString(),
    };

    // Prevent sending duplicate messages
    if (!this.isMessageDuplicate(messageData)) {
      // Send the message to the backend
      this.chatService.sendMessage(messageData).subscribe(
        response => {
          console.log('Message saved to backend:', response);
          // Now we can safely push the message to the local messages array
          this.messages.push(messageData);
          this.webSocketService.sendMessage(messageData); // Send message through WebSocket
          this.updateMessageCache(); // Update messages in storage
          this.scrollToBottom(); // Scroll to bottom after sending message
          this.message = ''; // Clear input field
        },
        error => {
          console.error('Error sending message to backend:', error);
        }
      );
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Scroll to the bottom of the messages
  scrollToBottom(): void {
    setTimeout(() => {
      const messageContainer = document.querySelector('.messages');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 0);
  }

  // Load user details from local storage
  private loadUserDetails(): void {
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    if (userDetails && userDetails.userId) {
      this.userId = userDetails.userId;
      this.name = userDetails.name;
      this.email = userDetails.email;
      this.isDetailsSubmitted = true;

      this.webSocketService.connect();
      this.subscribeToNewMessages(); // Subscribe to incoming messages
    }
  }

  // Save user details to local storage
  private saveUserDetails(): void {
    const userDetails = {
      userId: this.userId,
      name: this.name,
      email: this.email,
    };
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
  }

  // Load messages from local storage
  private loadMessages(): void {
    const storedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    this.messages = storedMessages;
  }

  // Update messages in local storage
  private updateMessageCache(): void {
    localStorage.setItem('chatMessages', JSON.stringify(this.messages));
  }

  closeChat(){
    
  }
}
