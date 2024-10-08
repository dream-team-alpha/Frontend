import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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
  newMessageSubscription!: Subscription;

  constructor(
    private userService: UserService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
    this.loadMessages();

    // Subscribe to incoming messages from the WebSocket after details are submitted
    this.newMessageSubscription = this.webSocketService.receiveNewMessage().subscribe((message: Message) => {
      console.log('New message received:', message);
      if (!this.isMessageDuplicate(message)) {
        this.messages.push(message);
        this.scrollToBottom();
        this.updateMessageCache();
      }
    });
  
    // Connect to WebSocket if details have already been submitted
    if (this.isDetailsSubmitted) {
      this.webSocketService.connect(Number(this.userId));
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from the message stream to prevent memory leaks
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
    }
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
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
        this.webSocketService.connect(Number(this.userId));

        // Subscribe to incoming messages
        this.newMessageSubscription = this.webSocketService.receiveNewMessage().subscribe((message: Message) => {
          if (!this.isMessageDuplicate(message)) {
            this.messages.push(message);
            this.scrollToBottom(); // Scroll to bottom when receiving message
            this.updateMessageCache(); // Update messages in storage
          }
        });
      },
      (error) => {
        console.error('Error creating user:', error);
      }
    );
  }

  sendMessage(): void {
    // Validate message content
    if (this.message.trim() === '') return;

    const messageData: Message = {
      senderId: this.userId,
      receiverId: this.adminId.toString(),
      content: this.message,
      senderType: 'user',
      receiverType: 'admin',
      createdAt: new Date().toISOString(),
    };

    // Emit the message to the Socket.IO server
    this.webSocketService.sendMessage(messageData);

    // Push the message locally to display it in the chat
    this.messages.push(messageData);
    this.updateMessageCache(); // Update messages in storage
    this.scrollToBottom(); // Scroll to bottom after sending message
    this.message = ''; // Clear input field
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

      // Connect to WebSocket for existing user
      this.webSocketService.connect(Number(this.userId));
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
}
