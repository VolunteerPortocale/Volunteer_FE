import { EventCategory } from '../core/graphql/types';

export interface OptionItem {
  id: string;
  name: string;
  labelKey: string;
  category?: EventCategory;
}

export const EVENT_TYPES: OptionItem[] = [
  { id: 'social', name: 'Social', labelKey: 'ADD_EVENT.TYPES.SOCIAL', category: EventCategory.Social },
  { id: 'animal_care', name: 'Animal Care', labelKey: 'ADD_EVENT.TYPES.ANIMAL_CARE', category: EventCategory.AnimalCare },
  { id: 'children_and_youth', name: 'Children & Youth', labelKey: 'ADD_EVENT.TYPES.CHILDREN_AND_YOUTH', category: EventCategory.ChildrenAndYouth },
  { id: 'education', name: 'Education', labelKey: 'ADD_EVENT.TYPES.EDUCATION', category: EventCategory.Education },
  { id: 'environment', name: 'Environment', labelKey: 'ADD_EVENT.TYPES.ENVIRONMENT', category: EventCategory.Environment },
  { id: 'health', name: 'Health', labelKey: 'ADD_EVENT.TYPES.HEALTH', category: EventCategory.Health },
  { id: 'disability_support', name: 'Disability Support', labelKey: 'ADD_EVENT.TYPES.DISABILITY_SUPPORT', category: EventCategory.DisabilitySupport },
  { id: 'elderly_care', name: 'Elderly Care', labelKey: 'ADD_EVENT.TYPES.ELDERLY_CARE', category: EventCategory.ElderlyCare },
  { id: 'disaster', name: 'Disaster Relief', labelKey: 'ADD_EVENT.TYPES.DISASTER', category: EventCategory.Disaster },
  { id: 'poverty', name: 'Poverty Alleviation', labelKey: 'ADD_EVENT.TYPES.POVERTY', category: EventCategory.Poverty },
  { id: 'culture', name: 'Culture & Arts', labelKey: 'ADD_EVENT.TYPES.CULTURE', category: EventCategory.Culture },
  { id: 'sport', name: 'Sport', labelKey: 'ADD_EVENT.TYPES.SPORT', category: EventCategory.Sport },
  { id: 'festivals', name: 'Festivals & Events', labelKey: 'ADD_EVENT.TYPES.FESTIVALS', category: EventCategory.Festivals },
  { id: 'technology', name: 'Technology', labelKey: 'ADD_EVENT.TYPES.TECHNOLOGY', category: EventCategory.Technology },
  { id: 'business', name: 'Business', labelKey: 'ADD_EVENT.TYPES.BUSINESS', category: EventCategory.Business },
  { id: 'employment', name: 'Employment', labelKey: 'ADD_EVENT.TYPES.EMPLOYMENT', category: EventCategory.Employment },
  { id: 'science', name: 'Science', labelKey: 'ADD_EVENT.TYPES.SCIENCE', category: EventCategory.Science },
  { id: 'agriculture', name: 'Agriculture', labelKey: 'ADD_EVENT.TYPES.AGRICULTURE', category: EventCategory.Agriculture },
  { id: 'construction', name: 'Construction', labelKey: 'ADD_EVENT.TYPES.CONSTRUCTION', category: EventCategory.Construction },
  { id: 'religion', name: 'Religion', labelKey: 'ADD_EVENT.TYPES.RELIGION', category: EventCategory.Religion },
  { id: 'human_rights', name: 'Human Rights', labelKey: 'ADD_EVENT.TYPES.HUMAN_RIGHTS', category: EventCategory.HumanRights },
  { id: 'legal', name: 'Legal Aid', labelKey: 'ADD_EVENT.TYPES.LEGAL', category: EventCategory.Legal },
  { id: 'safety', name: 'Safety', labelKey: 'ADD_EVENT.TYPES.SAFETY', category: EventCategory.Safety },
  { id: 'family', name: 'Family', labelKey: 'ADD_EVENT.TYPES.FAMILY', category: EventCategory.Family },
  { id: 'lgbtq_plus', name: 'LGBTQ+', labelKey: 'ADD_EVENT.TYPES.LGBTQ_PLUS', category: EventCategory.LgbtqPlus },
  { id: 'refugee_support', name: 'Refugee Support', labelKey: 'ADD_EVENT.TYPES.REFUGEE_SUPPORT', category: EventCategory.RefugeeSupport },
  { id: 'international_volunteering', name: 'International Volunteering', labelKey: 'ADD_EVENT.TYPES.INTERNATIONAL_VOLUNTEERING', category: EventCategory.InternationalVolunteering },
  { id: 'tourism', name: 'Tourism', labelKey: 'ADD_EVENT.TYPES.TOURISM', category: EventCategory.Tourism },
  { id: 'heritage', name: 'Heritage', labelKey: 'ADD_EVENT.TYPES.HERITAGE', category: EventCategory.Heritage },
  { id: 'media', name: 'Media & Communication', labelKey: 'ADD_EVENT.TYPES.MEDIA', category: EventCategory.Media },
  { id: 'gardening', name: 'Gardening', labelKey: 'ADD_EVENT.TYPES.GARDENING', category: EventCategory.Gardening },
  { id: 'peace', name: 'Peace & Mediation', labelKey: 'ADD_EVENT.TYPES.PEACE', category: EventCategory.Peace },
  { id: 'addiction_recovery', name: 'Addiction Recovery', labelKey: 'ADD_EVENT.TYPES.ADDICTION_RECOVERY', category: EventCategory.AddictionRecovery },
  { id: 'other', name: 'Other', labelKey: 'ADD_EVENT.TYPES.OTHER', category: EventCategory.Other },
];
