export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CreateUserInput = {
  companyName?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  eventCategoryPreferences?: InputMaybe<Array<InputMaybe<EventCategory>>>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
  role: CreateUserRole;
};

export enum CreateUserRole {
  Moderator = 'MODERATOR',
  Ngo = 'NGO',
  Volunteer = 'VOLUNTEER'
}

export enum EventCategory {
  AddictionRecovery = 'ADDICTION_RECOVERY',
  Agriculture = 'AGRICULTURE',
  AnimalCare = 'ANIMAL_CARE',
  Business = 'BUSINESS',
  ChildrenAndYouth = 'CHILDREN_AND_YOUTH',
  Construction = 'CONSTRUCTION',
  Culture = 'CULTURE',
  DisabilitySupport = 'DISABILITY_SUPPORT',
  Disaster = 'DISASTER',
  Education = 'EDUCATION',
  ElderlyCare = 'ELDERLY_CARE',
  Employment = 'EMPLOYMENT',
  Environment = 'ENVIRONMENT',
  Family = 'FAMILY',
  Festivals = 'FESTIVALS',
  Gardening = 'GARDENING',
  Health = 'HEALTH',
  Heritage = 'HERITAGE',
  HumanRights = 'HUMAN_RIGHTS',
  InternationalVolunteering = 'INTERNATIONAL_VOLUNTEERING',
  Legal = 'LEGAL',
  LgbtqPlus = 'LGBTQ_PLUS',
  Media = 'MEDIA',
  Other = 'OTHER',
  Peace = 'PEACE',
  Poverty = 'POVERTY',
  RefugeeSupport = 'REFUGEE_SUPPORT',
  Religion = 'RELIGION',
  Safety = 'SAFETY',
  Science = 'SCIENCE',
  Social = 'SOCIAL',
  Sport = 'SPORT',
  Technology = 'TECHNOLOGY',
  Tourism = 'TOURISM'
}

export type Mutation = {
  __typename?: 'Mutation';
  createUser: User;
  deleteUser: Scalars['Boolean']['output'];
  resendRegistrationOtp: Scalars['Boolean']['output'];
  suspendUser: User;
  updateUser: User;
  validateRegistrationOtp: User;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteUserArgs = {
  id: Scalars['String']['input'];
};


export type MutationResendRegistrationOtpArgs = {
  email: Scalars['String']['input'];
};


export type MutationSuspendUserArgs = {
  id: Scalars['String']['input'];
  suspendedUntil: Scalars['String']['input'];
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationValidateRegistrationOtpArgs = {
  email: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  getAllUsers: Array<User>;
  getUserById: User;
};


export type QueryGetUserByIdArgs = {
  id: Scalars['String']['input'];
};

export type UpdateUserInput = {
  companyName?: InputMaybe<Scalars['String']['input']>;
  eventCategoryPreferences?: InputMaybe<Array<EventCategory>>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  eventCategoryPreferences?: Maybe<Array<EventCategory>>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  phoneNumber: Scalars['String']['output'];
  role: UserRole;
  status: UserStatus;
  suspendedUntil?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export enum UserRole {
  Admin = 'ADMIN',
  Moderator = 'MODERATOR',
  Ngo = 'NGO',
  Volunteer = 'VOLUNTEER'
}

export enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Suspended = 'SUSPENDED'
}
