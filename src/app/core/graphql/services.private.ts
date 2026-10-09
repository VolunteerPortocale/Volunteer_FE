/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './private/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type GetAllUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllUsersQuery = { getAllUsers: Array<{ id: string, firstName: string, lastName: string, email: string, phoneNumber: string, role: Types.UserRole, status: Types.UserStatus, createdAt: string }> };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { getCurrentUser: { id: string, firstName: string, lastName: string, email: string, phoneNumber: string, role: Types.UserRole, status: Types.UserStatus, createdAt: string, eventCategoryPreferences: Array<Types.EventCategory> | null, biography: string | null, language: Types.Language, notificationsEnabled: boolean, twoFactorEnabled: boolean } };

export type UpdateUserMutationVariables = Exact<{
  input: Types.UpdateUserInput;
}>;


export type UpdateUserMutation = { updateUser: { id: string, firstName: string, lastName: string, phoneNumber: string, biography: string | null } };

export type UpdateUserPreferencesMutationVariables = Exact<{
  input: Types.UpdateUserPreferencesInput;
}>;


export type UpdateUserPreferencesMutation = { updateUserPreferences: { id: string, eventCategoryPreferences: Array<Types.EventCategory> | null, language: Types.Language, notificationsEnabled: boolean, twoFactorEnabled: boolean } };

export type InitiateTwoFactorMutationVariables = Exact<{ [key: string]: never; }>;


export type InitiateTwoFactorMutation = { initiateTwoFactor: boolean };

export type ConfirmTwoFactorMutationVariables = Exact<{
  otp: string;
}>;


export type ConfirmTwoFactorMutation = { confirmTwoFactor: { id: string, twoFactorEnabled: boolean } };

export type SuspendUserMutationVariables = Exact<{
  id: string;
  suspendedUntil: string;
}>;


export type SuspendUserMutation = { suspendUser: { id: string, status: Types.UserStatus, suspendedUntil: string | null } };

export type DeleteUserMutationVariables = Exact<{
  id: string;
}>;


export type DeleteUserMutation = { deleteUser: boolean };

export const GetAllUsersDocument = gql`
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
  export class GetAllUsersGQL extends Apollo.Query<GetAllUsersQuery, GetAllUsersQueryVariables> {
    override document = GetAllUsersDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetCurrentUserDocument = gql`
    query GetCurrentUser {
  getCurrentUser {
    id
    firstName
    lastName
    email
    phoneNumber
    role
    status
    createdAt
    eventCategoryPreferences
    biography
    language
    notificationsEnabled
    twoFactorEnabled
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetCurrentUserGQL extends Apollo.Query<GetCurrentUserQuery, GetCurrentUserQueryVariables> {
    override document = GetCurrentUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateUserDocument = gql`
    mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    firstName
    lastName
    phoneNumber
    biography
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateUserGQL extends Apollo.Mutation<UpdateUserMutation, UpdateUserMutationVariables> {
    override document = UpdateUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateUserPreferencesDocument = gql`
    mutation UpdateUserPreferences($input: UpdateUserPreferencesInput!) {
  updateUserPreferences(input: $input) {
    id
    eventCategoryPreferences
    language
    notificationsEnabled
    twoFactorEnabled
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateUserPreferencesGQL extends Apollo.Mutation<UpdateUserPreferencesMutation, UpdateUserPreferencesMutationVariables> {
    override document = UpdateUserPreferencesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const InitiateTwoFactorDocument = gql`
    mutation InitiateTwoFactor {
  initiateTwoFactor
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class InitiateTwoFactorGQL extends Apollo.Mutation<InitiateTwoFactorMutation, InitiateTwoFactorMutationVariables> {
    override document = InitiateTwoFactorDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ConfirmTwoFactorDocument = gql`
    mutation ConfirmTwoFactor($otp: String!) {
  confirmTwoFactor(otp: $otp) {
    id
    twoFactorEnabled
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ConfirmTwoFactorGQL extends Apollo.Mutation<ConfirmTwoFactorMutation, ConfirmTwoFactorMutationVariables> {
    override document = ConfirmTwoFactorDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const SuspendUserDocument = gql`
    mutation SuspendUser($id: String!, $suspendedUntil: String!) {
  suspendUser(id: $id, suspendedUntil: $suspendedUntil) {
    id
    status
    suspendedUntil
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class SuspendUserGQL extends Apollo.Mutation<SuspendUserMutation, SuspendUserMutationVariables> {
    override document = SuspendUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteUserDocument = gql`
    mutation DeleteUser($id: String!) {
  deleteUser(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteUserGQL extends Apollo.Mutation<DeleteUserMutation, DeleteUserMutationVariables> {
    override document = DeleteUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }