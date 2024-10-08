import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/services/chat/chat.service';

@Component({
  selector: 'app-chat-dashboard',
  templateUrl: './chat-dashboard.component.html',
  styleUrls: ['./chat-dashboard.component.css']
})
export class ChatDashboardComponent implements OnInit {
  userId!: number; // Store the user ID from the route
  adminId: number = 3; // Assuming admin ID is 3; adjust as necessary
  messages: any[] = []; // To hold messages
  newMessageContent: string = ''; // Variable to hold the content of the new message

  constructor(private route: ActivatedRoute, private chatService: ChatService) {}

  ngOnInit(): void {
    // Subscribe to the route parameters to detect changes
    this.route.paramMap.subscribe(params => {
      this.userId = +params.get('id')!;
      this.loadMessages(); // Fetch messages for the new user ID
    });
  }

  loadMessages(): void {
    // Fetch messages using the userId and adminId
    this.chatService.getUserMessages(this.userId, this.adminId).subscribe((data: any[]) => {
      this.messages = data; // Store the messages
    });
  }

  // Method to send a new message
  sendMessage(): void {
    if (this.newMessageContent.trim() !== '') {
      const message = {
        content: this.newMessageContent,
        userId: this.userId,
        adminId: this.adminId,
        createdAt: new Date() // You might want to adjust this based on your backend
      };

      this.chatService.sendMessage(message).subscribe(response => {
        // Optionally, update the message list or refresh it after sending
        this.messages.push(response); // Push the newly sent message into the messages array
        this.newMessageContent = ''; // Clear the input field
      });
    }
  }
}
