import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { SocketService } from '../../../services/socket/socket.service';
import { User } from '../../../model/User';
import { generateUserId } from '../../../common/generateMethods';
import { UserService } from '../../../services/user/user.service';
import { NoSpaceDirective } from '../../../directives/no-space.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NoSpaceDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  user: User;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private socketService: SocketService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, this.noSpaceAllowed]],
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.user = {
        userId: '',
        username: this.loginForm.value.username,
        socketId: '',
        onlineStatus: true,
        currentRoomId: undefined
      };

      console.log(this.user);
      

      this.loginForm = this.fb.group({
        username: ['', [Validators.required, this.noSpaceAllowed]],
      })

      this.socketService.emitEvent('login', this.user);
      this.socketService.onEvent('login').subscribe((data) => {
        console.log(data);
        
        this.userService.setUserData(data);
        window.location.reload();
      });
    }
  }

  noSpaceAllowed(control: FormControl) {
    if (control.value != null && control.value.includes(' ')) {
      return { spaceError: true };
    }
    return null;
  }
}
