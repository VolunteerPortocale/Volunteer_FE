/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
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

export type GetLastThreeActiveEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLastThreeActiveEventsQuery = { getLastThreeActiveEvents: Array<{ id: string, category: Types.EventCategory, storageFolderId: string, status: Types.EventStatus, createdAt: string, createdBy: string | null, lastModifiedAt: string, lastModifiedBy: string | null, details: { title: string, description: string, startTime: string, endTime: string | null, location: string | null, nrVolunteers: number, contactPhone: string | null, contactEmail: string | null, dressCode: Types.EventDressCode }, files: Array<{ id: string, eventId: string, type: Types.EventFileType, originalName: string, contentType: string }> | null }> | null };

export type GetEventFilesQueryVariables = Exact<{
  eventId: string;
}>;


export type GetEventFilesQuery = { getEventFiles: Array<{ id: string, eventId: string, type: Types.EventFileType, storageFileId: string, originalName: string, contentType: string, size: number, index: number, createdAt: string }> };

export type IsEmailRegisteredQueryVariables = Exact<{
  email: string;
}>;


export type IsEmailRegisteredQuery = { isEmailRegistered: boolean };

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
    override client = 'public';
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
    override client = 'public';
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
    override client = 'public';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetLastThreeActiveEventsDocument = gql`
    query GetLastThreeActiveEvents {
  getLastThreeActiveEvents {
    id
    category
    storageFolderId
    status
    createdAt
    createdBy
    lastModifiedAt
    lastModifiedBy
    details {
      title
      description
      startTime
      endTime
      location
      nrVolunteers
      contactPhone
      contactEmail
      dressCode
    }
    files {
      id
      eventId
      type
      originalName
      contentType
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetLastThreeActiveEventsGQL extends Apollo.Query<GetLastThreeActiveEventsQuery, GetLastThreeActiveEventsQueryVariables> {
    override document = GetLastThreeActiveEventsDocument;
    override client = 'public';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetEventFilesDocument = gql`
    query GetEventFiles($eventId: String!) {
  getEventFiles(eventId: $eventId) {
    id
    eventId
    type
    storageFileId
    originalName
    contentType
    size
    index
    createdAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetEventFilesGQL extends Apollo.Query<GetEventFilesQuery, GetEventFilesQueryVariables> {
    override document = GetEventFilesDocument;
    override client = 'public';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const IsEmailRegisteredDocument = gql`
    query IsEmailRegistered($email: String!) {
  isEmailRegistered(email: $email)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IsEmailRegisteredGQL extends Apollo.Query<IsEmailRegisteredQuery, IsEmailRegisteredQueryVariables> {
    override document = IsEmailRegisteredDocument;
    override client = 'public';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }