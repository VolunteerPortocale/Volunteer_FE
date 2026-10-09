/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './public/types';

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