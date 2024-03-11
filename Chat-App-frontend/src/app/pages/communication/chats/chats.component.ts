import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../../model/User';
import { SocketService } from '../../../services/socket/socket.service';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css',
})
export class ChatsComponent implements OnInit {
  loggedInUser: User;
  constructor(private socketService: SocketService) {}
  ngOnInit(): void {
    this.loggedInUser = JSON.parse(localStorage.getItem('userData'));
    this.handleWindowLoad();
  }
  handleWindowLoad(): void {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (userData) {
      this.socketService.emitEvent('login', userData);
    }
  }
}
