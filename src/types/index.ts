export type Gender = 'Male' | 'Female' | 'Other';
export type Relationship = 'Friend' | 'Partner' | 'Parent' | 'Sibling' | 'Colleague' | 'Other';

export interface UserInputs {
  gender?: Gender;
  relationship?: Relationship;
  age?: number | null;
  budget?: number | null;
}

export enum MessageRole {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  messages: Message[];
  userInputs?: UserInputs;
  title?: string;
  createdAt: Date;
}