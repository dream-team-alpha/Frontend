import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { io } from 'socket.io-client';
import { ChatService } from 'src/app/services/chat/chat.service';
import { UserService } from 'src/app/services/user/user.service';
import { WebSocketService } from 'src/app/services/web-socket/websocket.service';
import { MatDialog } from '@angular/material/dialog';

export interface User {
  id: string;
  name: string;
  email: string;
}

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
  adminId: number = 3;
  userId: string = '';
  name: string = '';
  email: string = '';
  message: string = '';
  messages: Message[] = [];
  isChatOpen = false;
  isDetailsSubmitted = false;

  isCloseModalOpen = false;
  isChatClosed = false;

  feedback: string = '';
  rating: number = 0;
  @ViewChild('feedbackDialog') feedbackDialog!: TemplateRef<any>;

  private newMessageSubscription!: Subscription;
  private userCreatedSubscription!: Subscription;

  shouldShowTimestamp(index: number): boolean {
    if (index === this.messages.length - 1) {
      return true; // Always show the timestamp for the last message
    }
  
    const currentMessage = this.messages[index];
    const nextMessage = this.messages[index + 1];
  
    const currentTime = new Date(currentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nextTime = new Date(nextMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
    const isCurrentUser = currentMessage.senderType === 'user';
    const isNextUser = nextMessage.senderType === 'user';
  
    return currentTime !== nextTime || isCurrentUser !== isNextUser;
  }
  

  constructor(
    private userService: UserService,
    private webSocketService: WebSocketService,
    private chatService: ChatService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const socket = io('http://localhost:5000');
    this.webSocketService.setSocketInstance(socket);
    this.subscribeToUserCreation();
    this.loadUserDetails();
    this.loadMessages();
    this.loadChatClosedState();

    // Ensure we don't connect to WebSocket if the chat is closed
    if (this.isDetailsSubmitted && !this.isChatClosed) {
      this.webSocketService.connect();
      this.subscribeToNewMessages();
    }
    window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
  }

  ngOnDestroy(): void {
    if (this.userCreatedSubscription) {
      this.userCreatedSubscription.unsubscribe();
    }
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
    }
    // Always disconnect if the chat is closed to prevent lingering connections
    if (!this.isChatClosed) {
      this.webSocketService.disconnect();
    }

    window.removeEventListener('beforeunload', this.onBeforeUnload.bind(this));
  }

  private subscribeToUserCreation(): void {
    this.userCreatedSubscription = this.webSocketService.userCreated$.subscribe((user: User) => {
      console.log('New user created:', user);
      // Handle the new user creation event (e.g., update UI, show notification)
    });
  }

  private onBeforeUnload(event: BeforeUnloadEvent): void {
    // Check if the chat is closed before clearing storage.
    if (this.isChatClosed) {
      this.clearLocalStorage();
    }
  }

  private clearLocalStorage(): void {
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('isChatClosed');
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.scrollToBottom();
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

    this.userService.createUser(this.name, this.email).subscribe(
      (response: any) => {
        this.userId = response.id;
        this.isDetailsSubmitted = true;
        this.saveUserDetails();

        // Emit user creation event via WebSocket
        this.webSocketService.emitUserCreated({ id: this.userId, name: this.name, email: this.email });

        // Only connect if the chat is not closed
        if (!this.isChatClosed) {
          this.webSocketService.connect();
          this.subscribeToNewMessages();
        }
      },
      (error) => {
        console.error('Error creating user:', error);
      }
    );
  }

  private subscribeToNewMessages(): void {
    if (!this.newMessageSubscription) {
      this.newMessageSubscription = this.webSocketService
        .receiveNewMessage()
        .subscribe((message: Message) => {
          this.messages.push(message);
          this.scrollToBottom();
          this.updateMessageCache();
        });
    }
  }

  sendMessage(): void {
    if (this.message.trim() === '' || this.isChatClosed) return;

    const messageData: Message = {
      senderId: this.userId,
      receiverId: this.adminId.toString(),
      content: this.message,
      senderType: 'user',
      receiverType: 'admin',
      createdAt: new Date().toISOString(),
    };
    this.chatService.sendMessage(messageData).subscribe(
      (response) => {
        console.log('Message saved to backend:', response);
        this.messages.push(messageData);
        this.webSocketService.sendMessage(messageData);
        this.updateMessageCache();
        this.scrollToBottom();
        this.message = '';
      },
      (error) => {
        console.error('Error sending message to backend:', error);
      }
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const messageContainer = document.querySelector('.messages');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 0);
  }

  private loadUserDetails(): void {
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    if (userDetails && userDetails.userId) {
      this.userId = userDetails.userId;
      this.name = userDetails.name;
      this.email = userDetails.email;
      this.isDetailsSubmitted = true;

      if (!this.isChatClosed) {
        this.webSocketService.connect();
        this.subscribeToNewMessages();
      }
    }
  }

  private saveUserDetails(): void {
    const userDetails = {
      userId: this.userId,
      name: this.name,
      email: this.email,
    };
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
  }

  private loadMessages(): void {
    const storedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    this.messages = storedMessages;
  }

  private saveChatClosedState(): void {
    localStorage.setItem('isChatClosed', JSON.stringify(this.isChatClosed));
  }

  private loadChatClosedState(): void {
    const closedState = localStorage.getItem('isChatClosed');
    this.isChatClosed = closedState === 'true';
  }

  private updateMessageCache(): void {
    localStorage.setItem('chatMessages', JSON.stringify(this.messages));
  }

  closeChat(): void {
    this.isCloseModalOpen = true;
  }

  confirmCloseChat(): void {
    const closeChatMessage: Message = {
      senderId: this.userId,
      receiverId: this.adminId.toString(),
      content: 'The chat has been closed successfully',
      senderType: 'user',
      receiverType: 'admin',
      createdAt: new Date().toISOString(),
    };

    this.chatService.sendMessage(closeChatMessage).subscribe(
      (response) => {
        console.log('Message saved to backend:', response);
        this.webSocketService.sendMessage(closeChatMessage);
        this.messages.push(closeChatMessage);
        this.updateMessageCache();
        this.scrollToBottom();
        this.isChatClosed = true;
        this.saveChatClosedState();
        this.isCloseModalOpen = false;

        // Allow some time for WebSocket to finish sending the closing message
        setTimeout(() => {
          this.webSocketService.disconnect();
        }, 100);
      },
      (error) => {
        console.error('Error sending message to backend:', error);
      }
    );
    this.isCloseModalOpen = false;
    this.dialog.open(this.feedbackDialog);
  }

  cancelCloseChat(): void {
    this.isCloseModalOpen = false;
  }

  resetChat(): void {
    this.isChatClosed = false;
    this.saveChatClosedState();
    this.messages = [];
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('userDetails');
    this.webSocketService.connect();
    this.scrollToBottom();
    this.isChatOpen = !this.isChatOpen;
    window.location.reload();
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  closeFeedbackModal(): void {
    this.dialog.closeAll();
    this.resetFeedback(); // Reset rating and feedback
  }

  resetFeedback(): void {
    this.rating = 0;
    this.feedback = '';
  }

  submitFeedback(): void {
    if (this.rating === 0) {
      console.error('Please provide a star rating before submitting.');
      return;
    }

    const feedbackData = {
      adminId: this.adminId,
      userId: this.userId,
      feedback: this.feedback || null,
      rating: this.rating
    };

    this.chatService.submitFeedback(feedbackData).subscribe(
      (response) => {
        console.log('Feedback submitted successfully:', response);
        this.closeFeedbackModal();
      },
      (error) => {
        console.error('Error submitting feedback:', error);
      }
    );
  }
}
