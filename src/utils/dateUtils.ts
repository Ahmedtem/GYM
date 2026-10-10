import { Member } from '../types';

export function getTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addMonthsToDate(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setMonth(d.getMonth() + months);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDifference(targetDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export type SubscriptionStatus = 'active' | 'expiring_soon' | 'expired';

export function getSubscriptionStatus(endDateStr: string): {
  status: SubscriptionStatus;
  daysDiff: number;
  label: string;
  badgeColor: string;
} {
  const daysDiff = getDaysDifference(endDateStr);

  if (daysDiff < 0) {
    const daysAgo = Math.abs(daysDiff);
    return {
      status: 'expired',
      daysDiff,
      label: daysAgo === 0 ? 'انتهى اليوم' : `منتهي منذ ${daysAgo} ${daysAgo === 1 ? 'يوم' : daysAgo === 2 ? 'يومين' : daysAgo <= 10 ? 'أيام' : 'يوماً'}`,
      badgeColor: 'bg-rose-950/80 text-rose-400 border border-rose-800/60',
    };
  } else if (daysDiff <= 7) {
    return {
      status: 'expiring_soon',
      daysDiff,
      label: daysDiff === 0 ? 'ينتهي اليوم!' : `ينتهي خلال ${daysDiff} ${daysDiff === 1 ? 'يوم' : daysDiff === 2 ? 'يومين' : daysDiff <= 10 ? 'أيام' : 'يوماً'}`,
      badgeColor: 'bg-amber-950/80 text-amber-400 border border-amber-800/60',
    };
  } else {
    return {
      status: 'active',
      daysDiff,
      label: `ساري (متبقي ${daysDiff} يوماً)`,
      badgeColor: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60',
    };
  }
}

export function isLoyaltyGiftEligible(member: Member): boolean {
  const giftsEntitled = Math.floor((member.consecutiveMonths || 0) / 6);
  const giftsClaimed = member.giftsClaimed ? member.giftsClaimed.length : 0;
  return giftsEntitled > giftsClaimed;
}

export function getLoyaltyProgress(member: Member): {
  currentCycleMonths: number;
  neededMonths: number;
  percentage: number;
  totalConsecutive: number;
  giftsClaimedCount: number;
  isEligible: boolean;
} {
  const total = member.consecutiveMonths || 0;
  const giftsClaimedCount = member.giftsClaimed ? member.giftsClaimed.length : 0;
  const isEligible = isLoyaltyGiftEligible(member);
  
  // Progress towards current or next gift
  const currentCycleMonths = total % 6 === 0 && total > 0 && isEligible ? 6 : total % 6;
  const percentage = Math.min(100, Math.round((currentCycleMonths / 6) * 100));

  return {
    currentCycleMonths,
    neededMonths: 6,
    percentage,
    totalConsecutive: total,
    giftsClaimedCount,
    isEligible,
  };
}

export function formatArabicDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(amount);
}
