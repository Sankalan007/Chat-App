import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { socketBackendEnv } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private url = `${socketBackendEnv.hostname}:${socketBackendEnv.port}`;

  constructor() {
    this.socket = io(this.url);
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
  }

  joinRoom(roomId: string){
    this.socket.emit('join', roomId);
  }

  onEvent(event: string): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.off(event);
      };
    });
  }

  emitEvent(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
