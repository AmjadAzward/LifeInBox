export type LifeItemCategory =
  | 'BILL'
  | 'APPOINTMENT'
  | 'TRAVEL'
  | 'SUBSCRIPTION'
  | 'INSURANCE'
  | 'WARRANTY'
  | 'DOCUMENT_EXPIRY'
  | 'RESERVATION'
  | 'RETURN'
  | 'DELIVERY'
  | 'VEHICLE'
  | 'MEMBERSHIP'
  | 'MEDICATION'
  | 'BORROWING'
  | 'GENERAL_REMINDER';

export type LifeItemStatus =
  | 'UPCOMING'
  | 'NEEDS_ATTENTION'
  | 'DUE_TODAY'
  | 'OVERDUE'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'ARCHIVED';

export type ReminderChannel = 'PUSH' | 'EMAIL' | 'BOTH';
export type ReminderStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';

export type NotificationType = 'REMINDER' | 'SYSTEM' | 'INFO';

export interface LifeItem {
  id: string;
  workspaceId?: string | null;
  title: string;
  category: LifeItemCategory;
  description: string | null;
  organization: string | null;
  personName: string | null;
  amount: number | null;
  currency: string;
  issueDate: string | null;
  dueDate: string | null;
  eventDate: string | null;
  expiryDate: string | null;
  dueTime?: string | null;
  eventTime?: string | null;
  expiryTime?: string | null;
  referenceNumber: string | null;
  location: string | null;
  actionRequired: string | null;
  status: LifeItemStatus;
  recurring: boolean;
  recurrenceRule: string | null;
  aiGenerated: boolean;
  aiConfidence: number;
  confirmed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  archivedAt: string | null;
  attachments: Attachment[];
  reminders: Reminder[];
}

export interface Attachment {
  id: string;
  lifeItemId: string | null;
  fileName: string;
  fileType: 'IMAGE' | 'PDF';
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface Reminder {
  id: string;
  lifeItemId: string;
  remindAt: string;
  channel: ReminderChannel;
  status: ReminderStatus;
  sentAt: string | null;
  failedAt: string | null;
}

export interface Notification {
  id: string;
  lifeItemId: string | null;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  image: string | null;
  country: string;
  timezone: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UserPreference {
  pushEnabled: boolean;
  emailEnabled: boolean;
  morningSummary: boolean;
  weeklySummary: boolean;
  defaultNotificationTime: string;
  timezone: string;
}

export interface ExtractionResult {
  title: string;
  category: LifeItemCategory | null;
  description: string | null;
  organization: string | null;
  personName: string | null;
  amount: number | null;
  currency: string | null;
  issueDate: string | null;
  dueDate: string | null;
  eventDate: string | null;
  expiryDate: string | null;
  referenceNumber: string | null;
  location: string | null;
  actionRequired: string | null;
  confidence: number;
  fieldConfidence: Record<string, number>;
  suggestedReminders: string[];
}

export interface CalendarEvent {
  id: string;
  lifeItemId: string;
  title: string;
  category: LifeItemCategory;
  date: string;
  type: 'dueDate' | 'eventDate' | 'expiryDate';
}

export const CATEGORY_LABELS: Record<LifeItemCategory, string> = {
  BILL: 'Bills',
  APPOINTMENT: 'Appointments',
  TRAVEL: 'Travel',
  SUBSCRIPTION: 'Subscriptions',
  INSURANCE: 'Insurance',
  WARRANTY: 'Warranties',
  DOCUMENT_EXPIRY: 'Documents',
  RESERVATION: 'Reservations',
  RETURN: 'Returns',
  DELIVERY: 'Deliveries',
  VEHICLE: 'Vehicle',
  MEMBERSHIP: 'Memberships',
  MEDICATION: 'Medications',
  BORROWING: 'Borrowing',
  GENERAL_REMINDER: 'Reminders',
};

export const STATUS_LABELS: Record<LifeItemStatus, string> = {
  UPCOMING: 'Upcoming',
  NEEDS_ATTENTION: 'Needs Attention',
  DUE_TODAY: 'Due Today',
  OVERDUE: 'Overdue',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
  ARCHIVED: 'Archived',
};
