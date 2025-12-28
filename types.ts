export type Currency = 'USD' | 'KRW';
export type BillingCycle = 'monthly' | 'yearly';
export type Category = 'AI' | 'Development' | 'Design' | 'Productivity' | 'Storage' | 'Media' | 'Other';

export interface UserSettings {
  currency: Currency;
  language: 'ko' | 'en';
  notifications: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  settings: UserSettings;
  paymentMethods: string[]; // Added payment methods list
}

export interface Subscription {
  id: string;
  service_name: string;
  category: Category;
  plan_name: string;
  price: number;
  currency: Currency;
  billing_cycle: BillingCycle;
  billing_date: number; // 1-31
  next_billing_date: string; // ISO Date string
  icon_url?: string;
  notes?: string;
  status: 'active' | 'paused' | 'cancelled';
  payment_method?: string;
  color?: string;
  logo_url?: string;
}

export interface ExchangeRate {
  base: 'USD';
  target: 'KRW';
  rate: number;
  updated_at: string;
}

export interface AIAnalysisResult {
  service_name: string;
  category: Category;
  plan_name: string;
  price: number;
  currency: Currency;
  billing_cycle: BillingCycle;
}

export interface DashboardStats {
  totalMonthlyKrw: number;
  totalYearlyKrw: number;
  activeCount: number;
  mostExpensive: Subscription | null;
}

export interface ServiceTemplate {
  name: string;
  domain: string; // for logo
  category: Category;
  color: string;
  plans: {
    name: string;
    price: number;
    currency: Currency;
    billing_cycle: BillingCycle;
  }[];
}