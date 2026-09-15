import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private http = inject(HttpClient);

  getUsers(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/v1/users`);
  }
}