import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/services/chat/chat.service';
import { WebSocketService } from 'src/app/services/web-socket/websocket.service';
import { UserService, User } from 'src/app/services/user/user.service';
import { Message } from 'src/app/components/home/user-chat-box/user-chat-box.component';
import { Subscription } from 'rxjs';
import { ChatStateService } from 'src/app/services/chat-state/chat.state.service';

@Component({
  selector: 'app-chat-dashboard',
  templateUrl: './chat-dashboard.component.html',
  styleUrls: ['./chat-dashboard.component.css'],
})
export class ChatDashboardComponent
  implements OnInit, OnDestroy
{
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  userId!: string;
  adminId: string = '3';
  messages: Message[] = [];
  newMessageContent: string = '';
  newMessageSubscription: Subscription | undefined;
  private isSubscribed: boolean = false;
  user: User | undefined;
  isChatClosed: boolean = false; // Track chat state
  private chatClosedSubscription!: Subscription; // Subscription for chat closed state

  // Track if user is at the bottom of the message container
  private isAtBottom: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private webSocketService: WebSocketService,
    private userService: UserService,
    private chatStateService: ChatStateService // Inject the chat state service
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id')!;
      this.loadMessages();
      this.setCurrentUser();
      this.webSocketService.joinRoom(this.userId, this.adminId);
      this.subscribeToNewMessages();
    });
    // Subscribe to chat closed state
    this.chatClosedSubscription = this.chatStateService.chatClosed$.subscribe(closed => {
      this.isChatClosed = closed; // Update local state based on the service
    });
  }

  // In ChatDashboardComponent
  private subscribeToNewMessages(): void {
    if (!this.newMessageSubscription) {
      this.newMessageSubscription = this.webSocketService.receiveNewMessage().subscribe((message: Message) => {
        console.log('Received message in dashboard:', message); // Log received message
        console.log('Current User ID:', this.userId);
        if (message.senderId === this.userId) {
          console.log('Adding message to display:', message); // Log when message is added to display
          this.messages.push(message);
          if (this.isAtBottom) {
            this.scrollToBottom();
          }
        }
      });
    }
  }
  

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
    if (!this.isChatClosed) {
      this.webSocketService.disconnect();
    }
  }

  private cleanupSubscriptions(): void {
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
    }
  }

  confirmCloseChat(): void {
    this.isChatClosed = true;
    this.chatStateService.closeChat();
    this.webSocketService.emitChatClosed(this.userId, this.adminId);
    setTimeout(() => {
      this.webSocketService.disconnect();
    }, 100);
  }

  loadMessages(): void {
    this.chatService
      .getUserMessages(this.userId, this.adminId)
      .subscribe((data: Message[]) => {
        this.messages = data;
        if (this.isAtBottom) {
          this.scrollToBottom(); // Scroll to bottom after loading messages if user is at the bottom
        }
      });
  }

  setCurrentUser(): void {
    const userIdNum = Number(this.userId);
    if (isNaN(userIdNum)) {
      return; // No action if userId is invalid
    }
    this.userService.getUserById(userIdNum).subscribe((user) => {
      this.user = user;
    });
  }

  sendMessage(): void {
    if (this.newMessageContent.trim() !== '' && !this.isChatClosed) {
      const message: Message = {
        content: this.newMessageContent,
        senderId: this.adminId,
        receiverId: this.userId,
        senderType: 'admin',
        receiverType: 'user',
        createdAt: new Date().toISOString(),
      };

      if (!this.isMessageDuplicate(message)) {
        this.webSocketService.sendMessage(message, this.userId,this.adminId);
        this.chatService.sendMessage(message).subscribe(
          (response) => {
            if (!this.isMessageDuplicate(message)) {
              this.messages.push(message);
              if (this.isAtBottom) {
                this.scrollToBottom(); // Scroll to bottom after sending a message if user is at the bottom
              }
            }
            this.newMessageContent = ''; // Clear input field
          },
          (error) => {
            console.error('Error sending message to backend:', error);
          }
        );
      }
    }
  }

  private isMessageDuplicate(newMessage: Message): boolean {
    return this.messages.some(
      (msg) =>
        msg.content === newMessage.content &&
        msg.senderId === newMessage.senderId &&
        msg.receiverId === newMessage.receiverId &&
        Math.abs(
          new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime()
        ) < 1000
    );
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.messageContainer && this.messageContainer.nativeElement) {
          this.messageContainer.nativeElement.scroll({
            top: this.messageContainer.nativeElement.scrollHeight,
            left: 0,
            behavior: 'smooth',
          });
        }
      }, 100); // Adjust the delay if necessary to ensure messages are fully rendered before scrolling
    } catch (error) {
      console.error('Scroll to bottom error:', error);
    }
  }

  onScroll(): void {
    const scrollTop = this.messageContainer.nativeElement.scrollTop;
    const clientHeight = this.messageContainer.nativeElement.clientHeight;
    const scrollHeight = this.messageContainer.nativeElement.scrollHeight;
    
    this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // Adjust the threshold as needed
  }

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

  shouldShowDate(index: number): boolean {
    if (index === 0) return true; // Show the date for the first message

    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];

    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();

    return currentDate !== previousDate;
  }

  getMessageDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'long' };
    const month = date.toLocaleDateString(undefined, options);
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }
}
