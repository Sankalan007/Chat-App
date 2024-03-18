import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../../model/User';
import { SocketService } from '../../../services/socket/socket.service';
import { SharedDataService } from '../../../services/shared-data/shared-data.service';
import { Subscription } from 'rxjs';
import { Room } from '../../../model/Room';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css',
})
export class ChatsComponent implements OnInit, OnDestroy {
  loggedInUser: User;
  currentRoomId: string;
  roomInfo: Room;

  roomInfoSubscription: Subscription;
  messagesSubscription: Subscription;
  currentRoomIdSubscription: Subscription;

  messageForm: FormGroup;

  constructor(
    private socketService: SocketService,
    private sharedDataService: SharedDataService,
    private fb: FormBuilder
  ) {}
  ngOnInit(): void {
    this.messageForm = this.fb.group({
      message: ['', Validators.required],
    });

    
    this.loggedInUser = JSON.parse(localStorage.getItem('userData'));
    
    this.handleWindowLoad();

    if (this.currentRoomIdSubscription)
      this.currentRoomIdSubscription.unsubscribe();

    if (this.roomInfoSubscription) this.roomInfoSubscription.unsubscribe();

    this.currentRoomIdSubscription =
      this.sharedDataService.currentRoomId.subscribe((data) => {
        this.currentRoomId = data;

        this.socketService.joinRoom(this.currentRoomId);

        this.socketService.emitEvent('get-room-info', this.currentRoomId);
        if (this.roomInfoSubscription) this.roomInfoSubscription.unsubscribe();

        this.roomInfoSubscription = this.socketService
          .onEvent('get-room-info')
          .subscribe((res) => {
            this.roomInfo = res;
          });

        if (this.messagesSubscription) this.messagesSubscription.unsubscribe();
        this.messagesSubscription = this.socketService
          .onEvent('message')
          .subscribe((messages) => {
            this.roomInfo.messages.push(messages);
          });
      });
  }

  sendMessage() {
    const message = {
      senderId: this.loggedInUser.userId,
      roomId: this.currentRoomId,
      content: this.messageForm.get('message').value,
      isRead: Array(this.roomInfo.members.length).fill(false),
    };

    this.socketService.emitEvent('message', message);
    this.messageForm.reset();
  }

  formatDate(createdAt) {
    const currentDate = new Date();
    const createdDate = new Date(createdAt);

    if (createdDate.toDateString() === currentDate.toDateString()) {
      const hours = createdDate.getHours() % 12 || 12;
      const minutes = String(createdDate.getMinutes()).padStart(2, '0');
      const ampm = createdDate.getHours() >= 12 ? 'PM' : 'AM';
      return `${hours}:${minutes} ${ampm}`;
    }

    const yesterdayDate = new Date(currentDate);
    yesterdayDate.setDate(currentDate.getDate() - 1);

    if (createdDate.toDateString() === yesterdayDate.toDateString()) {
      const hours = createdDate.getHours() % 12 || 12;
      const minutes = String(createdDate.getMinutes()).padStart(2, '0');
      const ampm = createdDate.getHours() >= 12 ? 'PM' : 'AM';
      return `Yesterday, ${hours}:${minutes} ${ampm}`;
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    const formattedDate = createdDate.toLocaleDateString(undefined, options);
    const hours = createdDate.getHours() % 12 || 12;
    const minutes = String(createdDate.getMinutes()).padStart(2, '0');
    const ampm = createdDate.getHours() >= 12 ? 'PM' : 'AM';
    return `${formattedDate}, ${hours}:${minutes} ${ampm}`;
  }

  handleWindowLoad(): void {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (userData) {
      this.socketService.emitEvent('login', userData);
    }
  }

  ngOnDestroy(): void {
    this.roomInfoSubscription?.unsubscribe();
    this.currentRoomIdSubscription?.unsubscribe();
    this.messagesSubscription?.unsubscribe();
  }
}
