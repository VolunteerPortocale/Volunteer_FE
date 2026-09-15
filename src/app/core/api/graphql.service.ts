import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

const GET_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      name
      age
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {
  private apollo = inject(Apollo);

  getUsers(): Observable<unknown> {
    return this.apollo.watchQuery({
      query: GET_USERS,
    })
    .valueChanges.pipe(
      map((result: any) => result.data?.getAllUsers ?? [])
    );
  }
}