import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export const GET_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      firstName
      lastName
      email
      phoneNumber
      role
      status
      createdAt
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {
  private apollo = inject(Apollo);

  getUsers(): Observable<unknown> {
    return this.apollo.watchQuery<{ getAllUsers: unknown[] }>({
      query: GET_USERS,
    })
    .valueChanges.pipe(
      map((result) => result.data?.getAllUsers ?? [])
    );
  }
}