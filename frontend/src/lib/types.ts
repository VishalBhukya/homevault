export type Role = 'OWNER' | 'ADMIN' | 'MEMBER';
export type Plan = 'FREE' | 'ESSENTIAL' | 'FAMILY' | 'PRO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  householdId: string;
  household?: Household;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Household {
  id: string;
  name: string;
  plan: Plan;
  trialEndsAt: string | null;
  users?: Member[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string | null;
  recurrence: 'NONE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  assigneeId: string | null;
  assignee?: { id: string; name: string } | null;
  completedAt: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  location: string | null;
  category: string | null;
}

export interface Doc {
  id: string;
  title: string;
  category: string;
  notes: string | null;
  fileUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
  expiresAt: string | null;
  includeInBinder: boolean;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  category: string;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isEmergency: boolean;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  warrantyExpiresAt: string | null;
  location: string | null;
  notes: string | null;
  receiptId: string | null;
}

export interface ReceiptItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  hsaEligible: boolean;
  warrantyMonths: number | null;
}

export interface Receipt {
  id: string;
  merchant: string;
  purchaseDate: string;
  total: number;
  tax: number | null;
  category: string;
  paymentMethod: string | null;
  fileUrl: string | null;
  notes: string | null;
  source: string;
  items: ReceiptItem[];
  assets: { id: string; name: string }[];
}

export interface ReceiptDraft {
  merchant: string;
  purchaseDate: string | null;
  total: number;
  tax: number | null;
  category: string;
  paymentMethod: string | null;
  items: ReceiptItem[];
}

export interface Analytics {
  thisMonth: number;
  lastMonth: number;
  changePct: number | null;
  byMonth: { month: string; total: number }[];
  byCategory: { category: string; total: number }[];
  topMerchants: { merchant: string; total: number; visits: number }[];
  hsa: { total: number; items: { name: string; price: number; merchant: string; date: string }[] };
  subscriptions: { merchant: string; monthlyAmount: number; annualCost: number; months: number }[];
  insights: string[];
}

export interface EmergencyEntry {
  id: string;
  section: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface Binder {
  household: { id: string; name: string; members: Member[] };
  sections: { section: string; entries: EmergencyEntry[] }[];
  emergencyContacts: Contact[];
  documents: Doc[];
  readiness: number;
  checklist: { label: string; done: boolean }[];
  generatedAt: string;
}

export interface Alert {
  level: 'danger' | 'warning' | 'info';
  message: string;
  href: string;
}

export interface Dashboard {
  household: { id: string; name: string; plan: Plan; trialEndsAt: string | null };
  counts: { documents: number; contacts: number; assets: number; receipts: number; openTasks: number };
  overdueTasks: Task[];
  upcomingTasks: Task[];
  upcomingEvents: CalendarEvent[];
  expiring: { kind: 'DOCUMENT' | 'WARRANTY'; id: string; name: string; date: string; daysLeft: number }[];
  spending: {
    thisMonth: number;
    lastMonth: number;
    changePct: number | null;
    byMonth: { month: string; total: number }[];
    topCategories: { category: string; total: number }[];
  };
  readiness: number;
  alerts: Alert[];
}
