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

export type CreateEventDetailsInput = {
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description: EventDescriptionInput;
  dressCode: EventDressCode;
  endTime?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  nrVolunteers: Scalars['Int']['input'];
  startTime: Scalars['String']['input'];
  title: EventTitleInput;
};

export type CreateEventInput = {
  category: EventCategory;
  details: CreateEventDetailsInput;
  status: EventStatus;
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

export type Event = {
  __typename?: 'Event';
  category: EventCategory;
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  details: EventDetails;
  id: Scalars['String']['output'];
  lastModifiedAt: Scalars['String']['output'];
  lastModifiedBy?: Maybe<Scalars['String']['output']>;
  status: EventStatus;
  storageFolderId: Scalars['String']['output'];
};

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

export type EventDescriptionInput = {
  en?: InputMaybe<Scalars['String']['input']>;
  ro: Scalars['String']['input'];
  ru?: InputMaybe<Scalars['String']['input']>;
};

export type EventDetails = {
  __typename?: 'EventDetails';
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  dressCode: EventDressCode;
  endTime?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  nrVolunteers: Scalars['Int']['output'];
  startTime: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export enum EventDressCode {
  Casual = 'CASUAL',
  Costume = 'COSTUME',
  Formal = 'FORMAL'
}

export type EventFile = {
  __typename?: 'EventFile';
  contentType: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  eventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  index: Scalars['Int']['output'];
  originalName: Scalars['String']['output'];
  size: Scalars['Int']['output'];
  storageFileId: Scalars['String']['output'];
  type: EventFileType;
};

export enum EventFileType {
  Attachment = 'ATTACHMENT',
  Cover = 'COVER',
  Gallery = 'GALLERY'
}

export enum EventStatus {
  ApplicationsClosed = 'APPLICATIONS_CLOSED',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Draft = 'DRAFT',
  Full = 'FULL',
  InProgress = 'IN_PROGRESS',
  PendingApproval = 'PENDING_APPROVAL',
  Postponed = 'POSTPONED',
  Published = 'PUBLISHED',
  Rejected = 'REJECTED'
}

export type EventTitleInput = {
  en?: InputMaybe<Scalars['String']['input']>;
  ro: Scalars['String']['input'];
  ru?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createEvent: Event;
  createUser: User;
  deleteUser: Scalars['Boolean']['output'];
  resendRegistrationOtp: Scalars['Boolean']['output'];
  suspendUser: User;
  updateEvent: Event;
  updateUser: User;
  validateRegistrationOtp: User;
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
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


export type MutationUpdateEventArgs = {
  id: Scalars['String']['input'];
  input: UpdateEventInput;
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
  getAllEvents: Array<Event>;
  getAllUsers: Array<User>;
  getEventById: Event;
  getEventFiles: Array<EventFile>;
  getUserById: User;
};


export type QueryGetEventByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetEventFilesArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryGetUserByIdArgs = {
  id: Scalars['String']['input'];
};

export type UpdateEventDetailsInput = {
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description: EventDescriptionInput;
  dressCode: EventDressCode;
  endTime?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  nrVolunteers: Scalars['Int']['input'];
  startTime: Scalars['String']['input'];
  title: EventTitleInput;
};

export type UpdateEventInput = {
  category: EventCategory;
  details: UpdateEventDetailsInput;
  status: EventStatus;
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
