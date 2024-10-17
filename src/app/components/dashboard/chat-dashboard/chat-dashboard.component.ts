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
export class ChatDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  userId: any = '';
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
  ) {
    console.log('ChatDashboardComponent initialized');
  }

  ngOnInit(): void {
    this.webSocketService.connectGlobalSocket(); // Connect to the global socket
    this.subscribeToNewMessages(); // Subscribe to new messages
    this.route.url.subscribe((urlSegments) => {
      const currentUrl = urlSegments.map(segment => segment.path).join('/');
      if (currentUrl === 'chat') {
        this.webSocketService.connectGlobalSocket();
      }
    });
  
    this.fetchData();
  }
  

  fetchData() {
    console.log('fetchData called');
    this.route.paramMap.subscribe((params) => {
      console.log('Route params changed', params);
      this.userId = params.get('id');
      console.log('Fetched userId:', this.userId);
      if (this.userId) {
        this.initializeChat(this.userId); // Initialize chat for the user
      }
    });

    this.chatClosedSubscription = this.chatStateService.chatClosed$.subscribe(
      (closed) => {
        console.log('Chat closed state changed:', closed);
        this.isChatClosed = closed; // Update local state based on the service
      }
    );
    this.webSocketService.connectGlobalSocket();
    console.log('WebSocket connection initialized');
  }

  private initializeChat(userId: string): void {
    console.log('initializeChat called with userId:', userId);
    this.setCurrentUser(userId); // Set current user
    this.loadMessages(); // Load messages for the current user
    this.webSocketService.connectUserSocket(userId, this.adminId); // Connect to user-specific socket
    console.log('Connected WebSocket for userId:', userId, 'and adminId:', this.adminId);
  }

  private subscribeToNewMessages(): void {
    console.log('subscribeToNewMessages called');
    if (!this.newMessageSubscription || this.newMessageSubscription.closed) {
      this.newMessageSubscription = this.webSocketService.receiveNewMessage().subscribe(
        (message: Message) => {
          console.log('Received message in dashboard:', message);
          if (message.senderId === this.userId && !this.isMessageDuplicate(message)) {
            console.log('Adding message to display:', message);
            this.messages.push(message);
            if (this.isAtBottom) {
              this.scrollToBottom();
            }
          }
        }
      );
    }
  }
  

  ngOnDestroy(): void {
    console.log('ngOnDestroy called');
    this.cleanupSubscriptions();
    if (!this.isChatClosed) {
      console.log('Chat is not closed, disconnecting user WebSocket');
      this.webSocketService.disconnectUserSocket(this.userId); // Disconnect user-specific socket
    }
  }

  private cleanupSubscriptions(): void {
    console.log('cleanupSubscriptions called');
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
      console.log('Unsubscribed from new message subscription');
    }
  }

  confirmCloseChat(): void {
    console.log('confirmCloseChat called');
    this.isChatClosed = true;
    this.chatStateService.closeChat();
    this.webSocketService.emitChatClosed(this.userId, this.adminId);
    console.log('Emitted chat closed event for userId:', this.userId, 'and adminId:', this.adminId);
    setTimeout(() => {
      console.log('Disconnecting WebSocket after chat close');
      this.webSocketService.disconnectUserSocket(this.userId);
    }, 100);
  }

  loadMessages(): void {
    console.log('loadMessages called');
    this.chatService.getUserMessages(this.userId, this.adminId).subscribe(
      (data: Message[]) => {
        console.log('Messages loaded:', data);
        this.messages = data;
        if (this.isAtBottom) {
          this.scrollToBottom(); // Scroll to bottom after loading messages if user is at the bottom
        }
      },
      (error) => {
        console.error('Error loading messages:', error);
      }
    );
  }

  setCurrentUser(userId: string): void {
    console.log('setCurrentUser called with userId:', userId);
    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      console.warn('Invalid userId:', userId);
      return; // No action if userId is invalid
    }
    this.userService.getUserById(userIdNum).subscribe(
      (user) => {
        console.log('User fetched:', user);
        this.user = user; // Set current user
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
  }

  sendMessage(): void {
    console.log('sendMessage called with content:', this.newMessageContent);
    if (this.newMessageContent.trim() !== '' && !this.isChatClosed) {
      const message: Message = {
        content: this.newMessageContent,
        senderId: this.adminId,
        receiverId: this.userId,
        senderType: 'admin',
        receiverType: 'user',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      console.log('Message to be sent:', message);

      if (!this.isMessageDuplicate(message)) {
        this.webSocketService.sendMessage(message, this.userId, this.adminId);
        this.chatService.sendMessage(message).subscribe(
          (response) => {
            console.log('Message sent to backend:', response);
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
      } else {
        console.warn('Duplicate message detected, not sending');
      }
    } else {
      console.warn('Message content is empty or chat is closed');
    }
  }

  private isMessageDuplicate(newMessage: Message): boolean {
    const isDuplicate = this.messages.some(
      (msg) =>
        msg.content === newMessage.content &&
        msg.senderId === newMessage.senderId &&
        msg.receiverId === newMessage.receiverId &&
        Math.abs(
          new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime()
        ) < 1000
    );
    return isDuplicate;
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

    const currentTime = new Date(currentMessage.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const nextTime = new Date(nextMessage.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const isCurrentUser = currentMessage.senderType === 'user';
    const isNextUser = nextMessage.senderType === 'user';

    const shouldShow = currentTime !== nextTime || isCurrentUser !== isNextUser;
    return shouldShow;
  }

  shouldShowDate(index: number): boolean {
    if (index === 0) return true; // Show the date for the first message

    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];

    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();

    const shouldShow = currentDate !== previousDate;
    return shouldShow;
  }

  getMessageDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'long' };
    const month = date.toLocaleDateString(undefined, options);
    const day = date.getDate();
    const year = date.getFullYear();
    const formattedDate = `${month} ${day}, ${year}`;
    return formattedDate;
  }
}
