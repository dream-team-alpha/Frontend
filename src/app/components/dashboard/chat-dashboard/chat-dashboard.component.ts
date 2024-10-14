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
import { UserService, User } from 'src/app/services/user/user.service'; // Import UserService
import { Message } from 'src/app/components/home/user-chat-box/user-chat-box.component'; // Adjust this path based on your project structure
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-dashboard',
  templateUrl: './chat-dashboard.component.html',
  styleUrls: ['./chat-dashboard.component.css'],
})
export class ChatDashboardComponent
  implements OnInit, OnDestroy, AfterViewChecked
{

  
  shouldShowTimestamp(index: number): boolean {
    // Always show the timestamp for the last message
    if (index === this.messages.length - 1) {
      return true;
    }
  
    const currentMessage = this.messages[index];
    const nextMessage = this.messages[index + 1];
  
    // Compare the time part (hours and minutes) of the current message and the next message
    const currentTime = new Date(currentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nextTime = new Date(nextMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
    // Show the timestamp only if the next message's time differs from the current one
    return currentTime !== nextTime;
  }
  



  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  selectedUser: User | null = null;

  userId!: string;
  adminId: string = '3';
  messages: Message[] = [];
  newMessageContent: string = '';
  newMessageSubscription: Subscription | undefined;
  private isSubscribed: boolean = false; // Flag to check if the subscription is active
  users: User[] = []; // Store the users array
  user: User | undefined; // Store the current user object


  

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private webSocketService: WebSocketService,
    private userService: UserService // Inject UserService
  ) {}

  ngOnInit(): void {
    // Load all users when the component initializes
    this.loadUsers();

    // Subscribe to route parameters
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id')!;
      this.loadMessages();
      this.setCurrentUser(); // Set current user based on userId

      // Connect to WebSocket
      this.webSocketService.connect();

      // Subscribe to new messages if not already subscribed
      if (!this.isSubscribed) {
        this.newMessageSubscription = this.webSocketService
          .receiveNewMessage()
          .subscribe((message: Message) => {
            console.log('Received message:', message); // Log received message
            // Check if the message already exists to prevent duplicates
            if (!this.isMessageDuplicate(message)) {
              this.messages.push(message); // Add the message to the list
              this.scrollToBottom();
            }
          });
        this.isSubscribed = true; // Mark as subscribed
      }
    });
  }

    


  onUserSelected(user: User): void {
    this.selectedUser = user; // Update the selected user
  }

  ngAfterViewChecked() {
    this.scrollToBottom(); // Scroll to the bottom after each view check
  }

  ngOnDestroy(): void {
    // Unsubscribe from new messages on component destruction
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
      this.newMessageSubscription = undefined; // Prevent memory leaks
    }
  }

  loadMessages(): void {
    const userIdNum = Number(this.userId);
    const adminIdNum = Number(this.adminId);
    this.chatService
      .getUserMessages(userIdNum, adminIdNum)
      .subscribe((data: Message[]) => {
        this.messages = data; // Store the messages
        this.scrollToBottom(); // Scroll to bottom after loading messages
      });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((data: User[]) => {
      this.users = data; // Store the users
    });
  }

  setCurrentUser(): void {
    const userIdNum = Number(this.userId); // Convert userId to number
    this.user = this.users.find((user) => user.id === userIdNum); // Find the current user from the users array
  }

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

      // Check if the message is a duplicate
      if (!this.isMessageDuplicate(message)) {
        this.webSocketService.sendMessage(message); // Use Socket.IO to send message

        // Send the message to the backend
        this.chatService.sendMessage(message).subscribe(
          (response) => {
            console.log('Message saved to backend:', response);
            // Only push the message if it was successfully sent and not already added
            if (!this.isMessageDuplicate(message)) {
              this.messages.push(message); // Push the newly sent message into the messages array
              this.scrollToBottom(); // Scroll to bottom after sending message
            }
            this.newMessageContent = ''; // Clear the input field
          },
          (error) => {
            console.error('Error sending message to backend:', error);
          }
        );
      }
    }
  }

  private isMessageDuplicate(newMessage: Message): boolean {
    // Check if the message already exists in the messages array
    return this.messages.some(
      (msg) =>
        msg.content === newMessage.content &&
        msg.senderId === newMessage.senderId &&
        msg.receiverId === newMessage.receiverId &&
        Math.abs(
          new Date(msg.createdAt).getTime() -
            new Date(newMessage.createdAt).getTime()
        ) < 1000 // Check if the messages were sent within 1 second
    );
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }
}
