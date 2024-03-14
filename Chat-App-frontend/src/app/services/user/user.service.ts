import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../model/User';
import { socketBackendEnv } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${socketBackendEnv.hostname}:${socketBackendEnv.port}`;

  private userDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );
  public userData$: Observable<any> = this.userDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  setUserData(userData: any): void {
    this.userDataSubject.next(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }
}
