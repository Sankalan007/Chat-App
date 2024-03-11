import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ChannelBarComponent } from './components/channel-bar/channel-bar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ChannelBarComponent,
    SidebarComponent,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Chat App';
  constructor(private router: Router) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.setupDraggableDivider();
  }

  isNoNavRoute() {
    return this.router.url == '/login';
  }

  private setupDraggableDivider(): void {
    const draggable = document.getElementById('draggable');
    const container = document.getElementById('draggable-container');
    const sidebarContainer = document.getElementById('sidebar-container');
    const routerOutletContainer = document.getElementById(
      'router-outlet-container'
    );
    const channelBarWidth = document.getElementById('channel-bar')?.offsetWidth;

    let isDragging = false;

    draggable?.addEventListener('mousedown', (event) => {
      isDragging = true;
      const initialX = event.clientX;
      const initialWidth = sidebarContainer.offsetWidth;

      document.addEventListener('mousemove', resizeContainer);

      document.addEventListener('mouseup', () => {
        isDragging = false;
        document.removeEventListener('mousemove', resizeContainer);
      });

      function resizeContainer(event) {
        if (isDragging) {
          const widthChange = event.clientX - initialX;
          const newSidebarWidth = Math.max(
            0.2 * container.offsetWidth,
            initialWidth + widthChange
          );
          // const availableWidth =
          //   container.offsetWidth - newSidebarWidth - channelBarWidth;
          // let newRouterOutletWidth;
          // if (availableWidth < 0.4 * container.offsetWidth - channelBarWidth) {
          //   newRouterOutletWidth = Math.max(
          //     0.4 * container.offsetWidth - channelBarWidth,
          //     routerOutletContainer.offsetWidth + widthChange
          //   );
          // } else {
          //   newRouterOutletWidth = Math.min(
          //     routerOutletContainer.offsetWidth + widthChange,
          //     availableWidth
          //   );
          // }

          const newRouterOutletWidth =
            container.offsetWidth - newSidebarWidth - channelBarWidth;

          sidebarContainer.style.width = newSidebarWidth + 'px';
          routerOutletContainer.style.width = newRouterOutletWidth + 'px';
        }
      }
    });
  }
}
