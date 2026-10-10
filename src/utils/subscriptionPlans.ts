import { SubscriptionPlanId } from '../types';
import { addMonthsToDate } from './dateUtils';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  badgeLabel: string;
  tag: string;
  days: number;
  monthsEquivalent: number; // for loyalty calculation (consecutive months)
  defaultPrice: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentColor: string;
  description: string;
  icon: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'session',
    name: 'حصة',
    badgeLabel: 'حصة',
    tag: 'يوم واحد',
    days: 1,
    monthsEquivalent: 0,
    defaultPrice: 50,
    badgeBg: 'bg-zinc-100',
    badgeText: 'text-zinc-800',
    badgeBorder: 'border-zinc-300',
    accentColor: '#71717a',
    description: 'تمرين فردي ليوم واحد',
    icon: '🎟️',
  },
  {
    id: 'week',
    name: 'أسبوع',
    badgeLabel: 'أسبوع',
    tag: '٧ أيام',
    days: 7,
    monthsEquivalent: 0.25,
    defaultPrice: 150,
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-200',
    accentColor: '#ea580c',
    description: 'اشتراك أسبوعي لمدة ٧ أيام',
    icon: '⚡',
  },
  {
    id: 'half_month',
    name: 'نصف شهر',
    badgeLabel: 'نصف شهر',
    tag: '١٥ يوماً',
    days: 15,
    monthsEquivalent: 0.5,
    defaultPrice: 250,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    accentColor: '#d97706',
    description: 'اشتراك لمدة أسبوعين (١٥ يوماً)',
    icon: '🌓',
  },
  {
    id: 'month',
    name: 'شهر',
    badgeLabel: 'شهر',
    tag: '٣٠ يوماً',
    days: 30,
    monthsEquivalent: 1,
    defaultPrice: 400,
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    accentColor: '#2563eb',
    description: 'اشتراك شهري عادي مفتوح طوال الشهر',
    icon: '🗓️',
  },
  {
    id: 'two_months',
    name: 'شهرين',
    badgeLabel: 'شهرين',
    tag: '٦٠ يوماً',
    days: 60,
    monthsEquivalent: 2,
    defaultPrice: 750,
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    accentColor: '#4f46e5',
    description: 'اشتراك شهرين متتاليين بسعر مخفض',
    icon: '✌️',
  },
  {
    id: 'three_months',
    name: 'ثلاث شهور',
    badgeLabel: '٣ شهور',
    tag: '٩٠ يوماً',
    days: 90,
    monthsEquivalent: 3,
    defaultPrice: 1050,
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    accentColor: '#059669',
    description: 'اشتراك ربع سنوي موفر ومناسب للمستمرين',
    icon: '🥉',
  },
  {
    id: 'six_months',
    name: '٦ شهور',
    badgeLabel: '٦ شهور',
    tag: 'نصف سنوي',
    days: 180,
    monthsEquivalent: 6,
    defaultPrice: 1900,
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
    accentColor: '#9333ea',
    description: 'اشتراك نصف سنوي يؤهل المشترك مباشرة لهدية برنامج الولاء!',
    icon: '👑',
  },
  {
    id: 'alternate_days',
    name: 'اشتراك يوم ويوم',
    badgeLabel: 'يوم ويوم',
    tag: 'أيام تبادلية',
    days: 30,
    monthsEquivalent: 1,
    defaultPrice: 300,
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
    accentColor: '#0d9488',
    description: 'اشتراك شهري لأيام متبادلة (٣ أيام أسبوعياً كـ سبت/إثنين/أربعاء أو أحد/ثلاثاء/خميس)',
    icon: '🔄',
  },
];

export const DEFAULT_PLAN_PRICES: Record<SubscriptionPlanId, number> = {
  session: 50,
  week: 150,
  half_month: 250,
  month: 400,
  two_months: 750,
  three_months: 1050,
  six_months: 1900,
  alternate_days: 300,
};

const STORAGE_KEY_PLAN_PRICES = 'monster_gym_plan_prices';

/**
 * Retrieves the customized plan prices from localStorage, falling back to DEFAULT_PLAN_PRICES.
 */
export function getCustomPlanPrices(): Record<SubscriptionPlanId, number> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PLAN_PRICES);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_PLAN_PRICES, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load plan prices from localStorage', e);
  }
  return { ...DEFAULT_PLAN_PRICES };
}

/**
 * Persists customized plan prices to localStorage.
 */
export function saveCustomPlanPrices(prices: Record<SubscriptionPlanId, number>): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLAN_PRICES, JSON.stringify(prices));
  } catch (e) {
    console.error('Failed to save plan prices to localStorage', e);
  }
}

/**
 * Resets plan prices back to system defaults.
 */
export function resetCustomPlanPrices(): Record<SubscriptionPlanId, number> {
  try {
    localStorage.removeItem(STORAGE_KEY_PLAN_PRICES);
  } catch (e) {
    console.error('Failed to reset plan prices in localStorage', e);
  }
  return { ...DEFAULT_PLAN_PRICES };
}

/**
 * Returns all subscription plans with prices updated according to customPrices.
 */
export function getSubscriptionPlans(customPrices?: Record<SubscriptionPlanId, number>): SubscriptionPlan[] {
  const prices = customPrices || getCustomPlanPrices();
  return SUBSCRIPTION_PLANS.map((plan) => ({
    ...plan,
    defaultPrice: prices[plan.id] !== undefined ? prices[plan.id] : plan.defaultPrice,
  }));
}

export function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculatePlanEndDate(startDate: string, planId: SubscriptionPlanId): string {
  if (!startDate) return '';
  switch (planId) {
    case 'session':
      // Valid for the session day itself
      return startDate;
    case 'week':
      return addDaysToDate(startDate, 7);
    case 'half_month':
      return addDaysToDate(startDate, 15);
    case 'month':
      return addMonthsToDate(startDate, 1);
    case 'two_months':
      return addMonthsToDate(startDate, 2);
    case 'three_months':
      return addMonthsToDate(startDate, 3);
    case 'six_months':
      return addMonthsToDate(startDate, 6);
    case 'alternate_days':
      return addMonthsToDate(startDate, 1);
    default:
      return addMonthsToDate(startDate, 1);
  }
}

export function getPlanById(
  planId?: string, 
  durationMonths?: number,
  customPrices?: Record<SubscriptionPlanId, number>
): SubscriptionPlan {
  let basePlan: SubscriptionPlan;

  if (planId) {
    const found = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (found) basePlan = found;
    else basePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'month')!;
  } else if (durationMonths !== undefined) {
    if (durationMonths === 6) basePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'six_months')!;
    else if (durationMonths === 3) basePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'three_months')!;
    else if (durationMonths === 2) basePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'two_months')!;
    else if (durationMonths === 0.5) basePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'half_month')!;
    else if (durationMonths === 0.25) basePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'week')!;
    else if (durationMonths === 0) basePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'session')!;
    else basePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'month')!;
  } else {
    basePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'month')!;
  }

  // Check if there is an active custom price
  const prices = customPrices || getCustomPlanPrices();
  if (prices && prices[basePlan.id] !== undefined) {
    return {
      ...basePlan,
      defaultPrice: prices[basePlan.id],
    };
  }

  return basePlan;
}
