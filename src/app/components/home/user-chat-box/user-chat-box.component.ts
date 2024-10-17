import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
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
  adminId: string = '3';
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

  constructor(
    private userService: UserService,
    private webSocketService: WebSocketService,
    private chatService: ChatService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
    this.loadMessages();
    this.loadChatClosedState();

    if (this.isDetailsSubmitted && !this.isChatClosed) {
      this.webSocketService.connectUserSocket(this.userId, this.adminId); // Connect user socket
      this.subscribeToNewMessages();
    }

    this.subscribeToUserCreation();
    window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
    if (!this.isChatClosed) {
      this.webSocketService.disconnectUserSocket(this.userId); // Disconnect user socket
    }
    window.removeEventListener('beforeunload', this.onBeforeUnload.bind(this));
  }

  private subscribeToUserCreation(): void {
    this.userCreatedSubscription = this.webSocketService.userCreated$.subscribe((user: User) => {
      console.log('New user created:', user);
    });
  }

  private onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.isChatClosed) {
      this.clearLocalStorage();
    }
  }

  private clearLocalStorage(): void {
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('isChatClosed');
  }

  shouldShowTimestamp(index: number): boolean {
    if (index === this.messages.length - 1) {
      return true;
    }
  
    const currentMessage = this.messages[index];
    const nextMessage = this.messages[index + 1];
  
    const currentTime = new Date(currentMessage.createdAt).toISOString().slice(0, 19).replace('T', ' ');
    const nextTime = new Date(nextMessage.createdAt).toISOString().slice(0, 19).replace('T', ' ');
  
    const isCurrentUser = currentMessage.senderType === 'user';
    const isNextUser = nextMessage.senderType === 'user';
  
    return currentTime !== nextTime || isCurrentUser !== isNextUser;
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
  
        this.webSocketService.emitUserCreated({ id: this.userId, name: this.name, email: this.email });
  
        if (!this.isChatClosed) {
          this.webSocketService.connectUserSocket(this.userId, this.adminId); // Connect user socket here
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
      this.newMessageSubscription = this.webSocketService.message$.subscribe((message: Message) => {
        this.messages.push(message);
        this.scrollToBottom();
        this.updateMessageCache();
      });
    }
  }

  sendMessage(): void {
    if (this.message.trim() === '' || this.isChatClosed) return;
  
    const messageData: Message = {
      senderId: this.userId.toString(),
      receiverId: this.adminId.toString(),
      content: this.message,
      senderType: 'user',
      receiverType: 'admin',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
  
    this.chatService.sendMessage(messageData).subscribe(
      (response) => {
        console.log('Message saved to backend:', response);
        this.webSocketService.sendMessage(messageData, this.userId, this.adminId); // Send message to the specific room
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
        this.webSocketService.connectUserSocket(this.userId, this.adminId); // Connect user socket
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
      senderId: this.userId.toString(),
      receiverId: this.adminId.toString(),
      content: 'The chat has been closed successfully',
      senderType: 'user',
      receiverType: 'admin',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    this.chatService.sendMessage(closeChatMessage).subscribe(
      (response) => {
        console.log('Message saved to backend:', response);
        this.webSocketService.sendMessage(closeChatMessage, this.userId, this.adminId);
        this.updateMessageCache();
        this.scrollToBottom();
        this.isChatClosed = true;
        this.saveChatClosedState();
        this.isCloseModalOpen = false;

        setTimeout(() => {
          this.webSocketService.disconnectUserSocket(this.userId); // Disconnect user socket
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
    this.scrollToBottom();
    this.isChatOpen = !this.isChatOpen;
    window.location.reload();
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  private cleanupSubscriptions(): void {
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
    }
    if (this.userCreatedSubscription) {
      this.userCreatedSubscription.unsubscribe();
    }
  }

  closeFeedbackModal(): void {
    this.dialog.closeAll();
    this.resetFeedback();
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
      feedbackText: this.feedback || null,
      rating: this.rating,
    };

    console.log('Submitting Feedback:', feedbackData);

    this.chatService.submitFeedback(feedbackData).subscribe(
      (response) => {
        console.log('Feedback submitted:', response);
        this.closeFeedbackModal();
      },
      (error) => {
        console.error('Error submitting feedback:', error);
      }
    );
  }
}

