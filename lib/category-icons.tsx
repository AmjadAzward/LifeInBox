import {
  Receipt,
  CalendarCheck,
  Plane,
  RefreshCw,
  ShieldCheck,
  Shield,
  FileText,
  UtensilsCrossed,
  PackageOpen,
  Truck,
  Car,
  Award,
  Pill,
  HandHeart,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import type { LifeItemCategory } from './types';

export const CATEGORY_ICONS: Record<LifeItemCategory, LucideIcon> = {
  BILL: Receipt,
  APPOINTMENT: CalendarCheck,
  TRAVEL: Plane,
  SUBSCRIPTION: RefreshCw,
  INSURANCE: ShieldCheck,
  WARRANTY: Shield,
  DOCUMENT_EXPIRY: FileText,
  RESERVATION: UtensilsCrossed,
  RETURN: PackageOpen,
  DELIVERY: Truck,
  VEHICLE: Car,
  MEMBERSHIP: Award,
  MEDICATION: Pill,
  BORROWING: HandHeart,
  GENERAL_REMINDER: Bell,
};

export const CATEGORY_COLORS: Record<
  LifeItemCategory,
  { bg: string; text: string; dot: string }
> = {
  BILL: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  APPOINTMENT: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  TRAVEL: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  SUBSCRIPTION: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  INSURANCE: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  WARRANTY: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  DOCUMENT_EXPIRY: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  RESERVATION: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  RETURN: { bg: 'bg-lime-50', text: 'text-lime-700', dot: 'bg-lime-500' },
  DELIVERY: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  VEHICLE: { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-500' },
  MEMBERSHIP: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  MEDICATION: { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-500' },
  BORROWING: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  GENERAL_REMINDER: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
};
