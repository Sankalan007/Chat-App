import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  currentRoomId: BehaviorSubject<string> = new BehaviorSubject<string>('');
  
  constructor() { }
  setCurrentRoomId(roomId: any) {
    this.currentRoomId.next(roomId);
  }
}
