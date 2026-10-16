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


export type ConfirmTwoFactorMutation = { confirmTwoFactor: boolean };

export type SuspendUserMutationVariables = Exact<{
  id: string;
  suspendedUntil: string;
}>;


export type SuspendUserMutation = { suspendUser: { id: string, status: Types.UserStatus, suspendedUntil: string | null } };

export type DeleteUserMutationVariables = Exact<{
  id: string;
}>;


export type DeleteUserMutation = { deleteUser: boolean };

export type CreateEventMutationVariables = Exact<{
  input: Types.CreateEventInput;
}>;


export type CreateEventMutation = { createEvent: { id: string, category: Types.EventCategory, storageFolderId: string, status: Types.EventStatus, createdAt: string, createdBy: string | null, details: { title: string, description: string, startTime: string, endTime: string | null, location: string | null, nrVolunteers: number, contactPhone: string | null, contactEmail: string | null, dressCode: Types.EventDressCode } } };

export type UpdateEventMutationVariables = Exact<{
  id: string;
  input: Types.UpdateEventInput;
}>;


export type UpdateEventMutation = { updateEvent: { id: string, category: Types.EventCategory, status: Types.EventStatus, details: { title: string, description: string, startTime: string, endTime: string | null, location: string | null, nrVolunteers: number, contactPhone: string | null, contactEmail: string | null, dressCode: Types.EventDressCode } } };

export type EnrollMutationVariables = Exact<{
  input: Types.CreateEnrollmentInput;
}>;


export type EnrollMutation = { enroll: { id: string, eventId: string, userId: string, status: Types.EnrollmentStatus } };

export type UnenrollMutationVariables = Exact<{
  input: Types.UnenrollInput;
}>;


export type UnenrollMutation = { unenroll: { status: Types.GenericStatus | null } };

export type GetAllEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllEventsQuery = { getAllEvents: Array<{ id: string, category: Types.EventCategory, status: Types.EventStatus, createdAt: string, createdBy: string | null, details: { title: string, description: string, startTime: string, endTime: string | null, location: string | null, nrVolunteers: number, contactPhone: string | null, contactEmail: string | null, dressCode: Types.EventDressCode }, files: Array<{ id: string, type: Types.EventFileType }> | null }> };

export type GetEventByIdQueryVariables = Exact<{
  id: string;
}>;


export type GetEventByIdQuery = { getEventById: { id: string, category: Types.EventCategory, status: Types.EventStatus, createdAt: string, createdBy: string | null, details: { title: string, description: string, startTime: string, endTime: string | null, location: string | null, nrVolunteers: number, contactPhone: string | null, contactEmail: string | null, dressCode: Types.EventDressCode }, files: Array<{ id: string, type: Types.EventFileType }> | null } };

export type GetCurrentUserEnrollmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserEnrollmentsQuery = { getCurrentUserEnrollments: Array<{ id: string, eventId: string, userId: string, status: Types.EnrollmentStatus }> };

export type GetEventEnrollmentByIdQueryVariables = Exact<{
  id: string;
}>;


export type GetEventEnrollmentByIdQuery = { getEventEnrollmentById: { id: string, eventId: string, userId: string, status: Types.EnrollmentStatus } | null };

export type GetCurrentUserEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserEventsQuery = { getCurrentUserEvents: Array<{ id: string, category: Types.EventCategory, status: Types.EventStatus, createdAt: string, createdBy: string | null, details: { title: string, description: string, startTime: string, endTime: string | null, location: string | null, nrVolunteers: number, contactPhone: string | null, contactEmail: string | null, dressCode: Types.EventDressCode }, files: Array<{ id: string, eventId: string, type: Types.EventFileType, originalName: string, contentType: string, size: number }> | null }> };

export type GetEventsCreatedByCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEventsCreatedByCurrentUserQuery = { getEventsCreatedByCurrentUser: Array<{ id: string, category: Types.EventCategory, status: Types.EventStatus, createdAt: string, createdBy: string | null, details: { title: string, description: string, startTime: string, endTime: string | null, location: string | null, nrVolunteers: number, contactPhone: string | null, contactEmail: string | null, dressCode: Types.EventDressCode }, files: Array<{ id: string, type: Types.EventFileType }> | null }> };

export type GetFilteredEventsQueryVariables = Exact<{
  input?: Types.EventFilterInput | null | undefined;
}>;


export type GetFilteredEventsQuery = { getFilteredEvents: { page: number, size: number, total: number, events: Array<{ id: string, category: Types.EventCategory, storageFolderId: string, status: Types.EventStatus, createdAt: string, createdBy: string | null, lastModifiedAt: string, lastModifiedBy: string | null, details: { title: string, description: string, startTime: string, endTime: string | null, location: string | null, nrVolunteers: number, contactPhone: string | null, contactEmail: string | null, dressCode: Types.EventDressCode }, files: Array<{ id: string, eventId: string, type: Types.EventFileType, originalName: string, contentType: string, size: number, index: number, createdAt: string }> | null }> } };

export type GetUserByIdQueryVariables = Exact<{
  id: string;
}>;


export type GetUserByIdQuery = { getUserById: { id: string, firstName: string, lastName: string, email: string, phoneNumber: string, role: Types.UserRole, status: Types.UserStatus, createdAt: string } };

export type ConfirmEnrollmentMutationVariables = Exact<{
  input: Types.ConfirmEnrollmentInput;
}>;


export type ConfirmEnrollmentMutation = { confirmEnrollment: { status: Types.GenericStatus | null } };

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
  confirmTwoFactor(otp: $otp)
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
export const CreateEventDocument = gql`
    mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    id
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
    category
    storageFolderId
    status
    createdAt
    createdBy
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class CreateEventGQL extends Apollo.Mutation<CreateEventMutation, CreateEventMutationVariables> {
    override document = CreateEventDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateEventDocument = gql`
    mutation UpdateEvent($id: String!, $input: UpdateEventInput!) {
  updateEvent(id: $id, input: $input) {
    id
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
    category
    status
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateEventGQL extends Apollo.Mutation<UpdateEventMutation, UpdateEventMutationVariables> {
    override document = UpdateEventDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const EnrollDocument = gql`
    mutation Enroll($input: CreateEnrollmentInput!) {
  enroll(input: $input) {
    id
    eventId
    userId
    status
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class EnrollGQL extends Apollo.Mutation<EnrollMutation, EnrollMutationVariables> {
    override document = EnrollDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UnenrollDocument = gql`
    mutation Unenroll($input: UnenrollInput!) {
  unenroll(input: $input) {
    status
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class UnenrollGQL extends Apollo.Mutation<UnenrollMutation, UnenrollMutationVariables> {
    override document = UnenrollDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllEventsDocument = gql`
    query GetAllEvents {
  getAllEvents {
    id
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
      type
    }
    category
    status
    createdAt
    createdBy
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllEventsGQL extends Apollo.Query<GetAllEventsQuery, GetAllEventsQueryVariables> {
    override document = GetAllEventsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetEventByIdDocument = gql`
    query GetEventById($id: String!) {
  getEventById(id: $id) {
    id
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
      type
    }
    category
    status
    createdAt
    createdBy
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetEventByIdGQL extends Apollo.Query<GetEventByIdQuery, GetEventByIdQueryVariables> {
    override document = GetEventByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetCurrentUserEnrollmentsDocument = gql`
    query GetCurrentUserEnrollments {
  getCurrentUserEnrollments {
    id
    eventId
    userId
    status
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetCurrentUserEnrollmentsGQL extends Apollo.Query<GetCurrentUserEnrollmentsQuery, GetCurrentUserEnrollmentsQueryVariables> {
    override document = GetCurrentUserEnrollmentsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetEventEnrollmentByIdDocument = gql`
    query GetEventEnrollmentById($id: String!) {
  getEventEnrollmentById(id: $id) {
    id
    eventId
    userId
    status
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetEventEnrollmentByIdGQL extends Apollo.Query<GetEventEnrollmentByIdQuery, GetEventEnrollmentByIdQueryVariables> {
    override document = GetEventEnrollmentByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetCurrentUserEventsDocument = gql`
    query GetCurrentUserEvents {
  getCurrentUserEvents {
    id
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
    category
    status
    createdAt
    createdBy
    files {
      id
      eventId
      type
      originalName
      contentType
      size
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetCurrentUserEventsGQL extends Apollo.Query<GetCurrentUserEventsQuery, GetCurrentUserEventsQueryVariables> {
    override document = GetCurrentUserEventsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetEventsCreatedByCurrentUserDocument = gql`
    query GetEventsCreatedByCurrentUser {
  getEventsCreatedByCurrentUser {
    id
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
      type
    }
    category
    status
    createdAt
    createdBy
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetEventsCreatedByCurrentUserGQL extends Apollo.Query<GetEventsCreatedByCurrentUserQuery, GetEventsCreatedByCurrentUserQueryVariables> {
    override document = GetEventsCreatedByCurrentUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetFilteredEventsDocument = gql`
    query GetFilteredEvents($input: EventFilterInput) {
  getFilteredEvents(input: $input) {
    page
    size
    total
    events {
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
        size
        index
        createdAt
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetFilteredEventsGQL extends Apollo.Query<GetFilteredEventsQuery, GetFilteredEventsQueryVariables> {
    override document = GetFilteredEventsDocument;
    
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
export const ConfirmEnrollmentDocument = gql`
    mutation ConfirmEnrollment($input: ConfirmEnrollmentInput!) {
  confirmEnrollment(input: $input) {
    status
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ConfirmEnrollmentGQL extends Apollo.Mutation<ConfirmEnrollmentMutation, ConfirmEnrollmentMutationVariables> {
    override document = ConfirmEnrollmentDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }