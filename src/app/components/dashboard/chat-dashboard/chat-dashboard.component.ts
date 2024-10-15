import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/services/chat/chat.service';
import { WebSocketService } from 'src/app/services/web-socket/websocket.service';
import { UserService, User } from 'src/app/services/user/user.service';
import { Message } from 'src/app/components/home/user-chat-box/user-chat-box.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-dashboard',
  templateUrl: './chat-dashboard.component.html',
  styleUrls: ['./chat-dashboard.component.css'],
})
export class ChatDashboardComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  userId!: string;
  adminId: string = '3';
  messages: Message[] = [];
  newMessageContent: string = '';
  newMessageSubscription: Subscription | undefined;
  private isSubscribed: boolean = false;
  user: User | undefined;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private webSocketService: WebSocketService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id')!;
      this.loadMessages();
      this.setCurrentUser();

      this.webSocketService.connect();

      if (!this.isSubscribed) {
        this.newMessageSubscription = this.webSocketService
          .receiveNewMessage()
          .subscribe((message: Message) => {
            if (!this.isMessageDuplicate(message)) {
              this.messages.push(message);
              this.scrollToBottom(); // Scroll to the bottom when a new message is received
            }
          });
        this.isSubscribed = true;
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom(); // Scroll to bottom after view checked
  }

  ngOnDestroy(): void {
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
      this.newMessageSubscription = undefined;
    }
  }

  loadMessages(): void {
    const userIdNum = Number(this.userId);
    const adminIdNum = Number(this.adminId);
    this.chatService
      .getUserMessages(userIdNum, adminIdNum)
      .subscribe((data: Message[]) => {
        this.messages = data;
        this.scrollToBottom(); // Scroll to bottom after loading messages
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
    if (this.newMessageContent.trim() !== '') {
      const message: Message = {
        content: this.newMessageContent,
        senderId: this.adminId,
        receiverId: this.userId,
        senderType: 'admin',
        receiverType: 'user',
        createdAt: new Date().toISOString(),
      };

      if (!this.isMessageDuplicate(message)) {
        this.webSocketService.sendMessage(message);
        this.chatService.sendMessage(message).subscribe(
          (response) => {
            if (!this.isMessageDuplicate(message)) {
              this.messages.push(message);
              this.scrollToBottom(); // Scroll to bottom after sending a message
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
    if (this.messageContainer) {
      try {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Scroll to bottom failed:', err);
      }
    }
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

  // New method to get the last message date
  getLastMessageDate(): string {
    if (this.messages.length === 0) return '';

    const lastMessage = this.messages[this.messages.length - 1]; // Get the last message
    const date = new Date(lastMessage.createdAt);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
