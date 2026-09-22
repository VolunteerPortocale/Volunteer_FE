/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type GetAllUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllUsersQuery = { getAllUsers: Array<{ id: string, firstName: string, lastName: string, email: string, phoneNumber: string, role: Types.UserRole, status: Types.UserStatus, createdAt: string }> };

export type GetUserByIdQueryVariables = Exact<{
  id: string;
}>;


export type GetUserByIdQuery = { getUserById: { id: string, firstName: string, lastName: string, email: string, phoneNumber: string, role: Types.UserRole, status: Types.UserStatus, createdAt: string, updatedAt: string | null, eventCategoryPreferences: Array<Types.EventCategory> | null } };

export type CreateUserMutationVariables = Exact<{
  input: Types.CreateUserInput;
}>;


export type CreateUserMutation = { createUser: { id: string, firstName: string, lastName: string, email: string, phoneNumber: string, role: Types.UserRole, status: Types.UserStatus, createdAt: string } };

export type ValidateRegistrationOtpMutationVariables = Exact<{
  email: string;
  otp: string;
}>;


export type ValidateRegistrationOtpMutation = { validateRegistrationOtp: { id: string, email: string, status: Types.UserStatus } };

export type ResendRegistrationOtpMutationVariables = Exact<{
  email: string;
}>;


export type ResendRegistrationOtpMutation = { resendRegistrationOtp: boolean };

export type UpdateUserMutationVariables = Exact<{
  input: Types.UpdateUserInput;
}>;


export type UpdateUserMutation = { updateUser: { id: string, firstName: string, lastName: string, phoneNumber: string } };

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
export const GetUserByIdDocument = gql`
    query GetUserById($id: String!) {
  getUserById(id: $id) {
    id
    firstName
    lastName
    email
    phoneNumber
    role
    status
    createdAt
    updatedAt
    eventCategoryPreferences
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetUserByIdGQL extends Apollo.Query<GetUserByIdQuery, GetUserByIdQueryVariables> {
    override document = GetUserByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateUserDocument = gql`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
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
  export class CreateUserGQL extends Apollo.Mutation<CreateUserMutation, CreateUserMutationVariables> {
    override document = CreateUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ValidateRegistrationOtpDocument = gql`
    mutation ValidateRegistrationOtp($email: String!, $otp: String!) {
  validateRegistrationOtp(email: $email, otp: $otp) {
    id
    email
    status
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ValidateRegistrationOtpGQL extends Apollo.Mutation<ValidateRegistrationOtpMutation, ValidateRegistrationOtpMutationVariables> {
    override document = ValidateRegistrationOtpDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ResendRegistrationOtpDocument = gql`
    mutation ResendRegistrationOtp($email: String!) {
  resendRegistrationOtp(email: $email)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ResendRegistrationOtpGQL extends Apollo.Mutation<ResendRegistrationOtpMutation, ResendRegistrationOtpMutationVariables> {
    override document = ResendRegistrationOtpDocument;
    
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