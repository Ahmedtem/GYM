import { Member } from '../types';
import { getSubscriptionStatus, formatArabicDate } from './dateUtils';

export function getWhatsAppLink(phone: string, message: string): string {
  // Normalize phone number (strip spaces, dashes, leading 0 to international format if Egyptian)
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('01')) {
    cleanPhone = '2' + cleanPhone; // Egypt country code +20
  } else if (!cleanPhone.startsWith('2') && cleanPhone.length === 10) {
    cleanPhone = '20' + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateExpiryMessage(member: Member): string {
  const { status, daysDiff } = getSubscriptionStatus(member.endDate);
  const formattedEndDate = formatArabicDate(member.endDate);

  if (status === 'expired') {
    const daysAgo = Math.abs(daysDiff);
    return `مرحباً يا كابتن ${member.name} 🏋️‍♂️
نود تذكيرك بأن اشتراكك في الجيم انتهى بتاريخ (${formattedEndDate})${daysAgo > 0 ? ` (منذ ${daysAgo} يوم)` : ''}.
نتطلع لرؤيتك مجدداً لتجديد الاشتراك ومواصلة تمارينك وأهدافك الرياضية! 💪🔥
نحن بانتظارك في أي وقت.`;
  } else if (status === 'expiring_soon') {
    return `مرحباً يا كابتن ${member.name} 🏋️‍♂️
نود تذكيرك بأن اشتراكك في الجيم أوشك على الانتهاء بتاريخ (${formattedEndDate}) - متبقي ${daysDiff} ${daysDiff === 1 ? 'يوم' : 'أيام'}.
بادر بالتجديد لمواصلة التمارين بدون انقطاع والاستفادة من برنامج ولاء المشتركين! 🏆💪`;
  } else {
    return `مرحباً يا كابتن ${member.name} 🏋️‍♂️
نتمنى لك يوماً رياضياً رائعاً! نذكرك بأن اشتراكك سارٍ حتى تاريخ (${formattedEndDate}).
عاش يا بطل! 💪🔥`;
  }
}

export function generateLoyaltyGiftMessage(member: Member): string {
  return `🎉 ألف مبروك يا كابتن ${member.name}! 🏆🎁
بمناسبة إكمالك ٦ أشهر متتالية من الاشتراك والالتزام الرياضي الرائع معنا في الجيم، يسعدنا إخبارك باستحقاقك "هدية برنامج ولاء العملاء" الخاصة بك! 🎁
تفضل بزيارة مكتب الاستقبال في الجيم لاستلام هديتك التقديرية.
فخورون بالتزامك ونتمنى لك دوام الصحة والقوة! 💪🔥`;
}
