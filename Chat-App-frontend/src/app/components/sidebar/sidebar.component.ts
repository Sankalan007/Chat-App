import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket/socket.service';
import { User } from '../../model/User';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user/user.service';
import { SharedDataService } from '../../services/shared-data/shared-data.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit, OnDestroy {
  loggedInUsersSubscription: Subscription;
  updateCurrentUserSubscription: Subscription;
  getUsersSubscription: Subscription;

  currentUser: User;
  otherUsers: User[];

  currentRoomId: string;

  constructor(
    private socketService: SocketService,
    private userService: UserService,
    private sharedDataService: SharedDataService
  ) {}

  allUsers: User[] = [];
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('userData'));
    console.log(this.currentUser);

    this.loggedInUsersSubscription = this.socketService
      .onEvent('logged-in-users')
      .subscribe(
        (res) => {
          this.allUsers = res;
          console.log(res);
          this.otherUsers = this.allUsers.filter(
            (user) => user.username !== this.currentUser.username
          );
        },
        (err) => {
          console.error(err);
        }
      );

    this.userService
      .getUsers()
      .subscribe((users) => {
        console.log(users);
        
        this.allUsers = users;
        this.otherUsers = this.allUsers.filter(
          (user) => user?.username !== this.currentUser?.username
        );
      });
  }

  updateCurrentRoomId(userIdToChat: string) {
    if (this.updateCurrentUserSubscription) {
      this.updateCurrentUserSubscription.unsubscribe();
    }

    this.socketService.emitEvent('update-current-room-id', {
      currentUserId: this.currentUser.userId,
      userIdToChat: userIdToChat,
    });
    this.updateCurrentUserSubscription = this.socketService
      .onEvent('update-current-room-id')
      .subscribe((data) => {
        console.log(data);
        this.currentRoomId = data.roomId;
        this.sharedDataService.setCurrentRoomId(data.roomId);
        this.currentUser.currentRoomId = data.roomId;
        this.socketService.joinRoom(this.currentRoomId);
        this.socketService.emitEvent('update-user', this.currentUser);
      });
  }

  ngOnDestroy(): void {
    this.loggedInUsersSubscription?.unsubscribe();
    this.updateCurrentUserSubscription?.unsubscribe();
  }
}
