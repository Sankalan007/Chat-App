import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket/socket.service';
import { User } from '../../model/User';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  currentUser: User;

  constructor(private router: Router, private socketService: SocketService){}

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('userData'));
    this.clickOutside();
  }
  dropdownToggle() {
    document.getElementById('myDropdown').classList.toggle('show');
  }

  clickOutside() {
    window.onclick = function (event) {
      if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName('dropdown-content');
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    };
  }

  logout(){
    this.socketService.disconnect();
    localStorage.removeItem('userData');
    window.location.reload();
  }
}
