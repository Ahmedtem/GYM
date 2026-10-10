import React from 'react';
import { 
  Phone, 
  Calendar, 
  DollarSign, 
  Gift, 
  RotateCw, 
  History, 
  Edit3, 
  Trash2, 
  MessageSquare,
  Award,
  Sparkles
} from 'lucide-react';
import { Member } from '../types';
import { 
  getSubscriptionStatus, 
  getLoyaltyProgress, 
  formatArabicDate, 
  formatCurrency 
} from '../utils/dateUtils';
import { getPlanById } from '../utils/subscriptionPlans';
import { getWhatsAppLink, generateExpiryMessage, generateLoyaltyGiftMessage } from '../utils/whatsappUtils';

interface MemberCardProps {
  member: Member;
  canDelete?: boolean;
  canEdit?: boolean;
  canRenew?: boolean;
  canAwardGift?: boolean;
  onRenew: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onShowHistory: (member: Member) => void;
  onAwardLoyaltyGift: (member: Member) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  canDelete = true,
  canEdit = true,
  canRenew = true,
  canAwardGift = true,
  onRenew,
  onEdit,
  onDelete,
  onShowHistory,
  onAwardLoyaltyGift,
}) => {
  const { status, label } = getSubscriptionStatus(member.endDate);
  const loyalty = getLoyaltyProgress(member);
  const plan = getPlanById(member.planType, member.durationMonths);

  const expiryMsg = generateExpiryMessage(member);
  const loyaltyMsg = generateLoyaltyGiftMessage(member);

  return (
    <div 
      id={`member-card-${member.id}`}
      className={`bg-white rounded-xl border transition-all duration-150 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-sm ${
        loyalty.isEligible 
          ? 'border-purple-300 ring-2 ring-purple-500/20' 
          : status === 'expired'
          ? 'border-rose-300'
          : status === 'expiring_soon'
          ? 'border-amber-300'
          : 'border-slate-200'
      }`}
    >
      <div>
        {/* Top Header: Member Name, Status Badge */}
        <div className="p-3.5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                loyalty.isEligible 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : member.gender === 'female'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {member.name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 leading-snug truncate">
                  <span className="truncate">{member.name}</span>
                  {loyalty.isEligible && (
                    <span title="مؤهل لهدية ولاء 6 أشهر">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 fill-purple-600 shrink-0" />
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <a 
                    href={`tel:${member.phone}`} 
                    className="text-xs text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
                    dir="ltr"
                  >
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{member.phone}</span>
                  </a>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold border ${plan.badgeBg} ${plan.badgeText} ${plan.badgeBorder}`}>
                    <span>{plan.icon}</span>
                    <span>{plan.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Status Pill */}
            {status === 'expired' ? (
              <span className="bg-rose-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0">
                منتهي
              </span>
            ) : status === 'expiring_soon' ? (
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0">
                قريباً
              </span>
            ) : (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0">
                نشط
              </span>
            )}
          </div>

          {/* Notes if available */}
          {member.notes && (
            <p className="mt-2 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 line-clamp-1">
              {member.notes}
            </p>
          )}
        </div>

        {/* Subscription Details */}
        <div className="p-3 space-y-2.5 text-xs">
          
          <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px] mb-0.5 font-medium">تاريخ البداية</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formatArabicDate(member.startDate)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] mb-0.5 font-medium">تاريخ الانتهاء</span>
              <span className={`font-semibold flex items-center gap-1 text-[11px] ${
                status === 'expired' ? 'text-rose-600' : status === 'expiring_soon' ? 'text-amber-600' : 'text-slate-700'
              }`}>
                <Calendar className="w-3 h-3" />
                {formatArabicDate(member.endDate)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-600 px-1 py-1 bg-slate-50/50 rounded-lg">
            <span className="text-slate-500 flex items-center gap-1 text-xs">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>الاشتراك:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${plan.badgeBg} ${plan.badgeText} ${plan.badgeBorder}`}>
                {plan.name} ({plan.tag})
              </span>
              <span className="font-bold text-slate-900 text-xs">
                {formatCurrency(member.amount)}
              </span>
            </div>
          </div>

          {/* Loyalty Program Section */}
          <div className={`p-2.5 rounded-lg border transition-all ${
            loyalty.isEligible
              ? 'bg-purple-50/70 border-purple-200'
              : 'bg-slate-50 border-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Award className={`w-3.5 h-3.5 ${loyalty.isEligible ? 'text-purple-600' : 'text-slate-400'}`} />
                برنامج الولاء
              </span>
              <span className="text-[11px] font-bold text-purple-700">
                {member.consecutiveMonths} أشهر متتالية
              </span>
            </div>

            {/* Progress Bar towards 6-month goal */}
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  loyalty.isEligible ? 'bg-purple-600' : 'bg-purple-600'
                }`}
                style={{ width: `${loyalty.percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
              <span>
                {loyalty.isEligible 
                  ? '🎉 أكمل ٦ أشهر متتالية!' 
                  : `متبقي ${6 - loyalty.currentCycleMonths} أشهر للهدية`}
              </span>
              <span className="font-medium">{loyalty.percentage}%</span>
            </div>

            {/* Loyalty Gift Callout if Eligible */}
            {loyalty.isEligible ? (
              <div className="mt-2 pt-2 border-t border-purple-200/80 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-900 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-purple-600" />
                    مستحق هدية الآن!
                  </span>
                  <a
                    href={getWhatsAppLink(member.phone, loyaltyMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                    title="إرسال تهنئة بالهدية عبر واتساب"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>إشعار</span>
                  </a>
                </div>
                <button
                  id={`btn-award-gift-${member.id}`}
                  onClick={() => onAwardLoyaltyGift(member)}
                  className="w-full py-1 px-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-transform active:scale-95"
                >
                  <Gift className="w-3 h-3" />
                  <span>تسليم هدية الولاء 🎁</span>
                </button>
              </div>
            ) : (
              member.giftsClaimed && member.giftsClaimed.length > 0 && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center gap-1">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>تم تسليم {member.giftsClaimed.length} هدية ولاء سابقة</span>
                </div>
              )
            )}
          </div>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1">
        {/* Contact buttons */}
        <div className="flex items-center gap-0.5">
          <a
            href={getWhatsAppLink(member.phone, expiryMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
            title="مراسلة وتنبيه عبر واتساب"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => onShowHistory(member)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            title="سجل الاشتراكات والهدايا"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          {canEdit && (
            <button
              onClick={() => onEdit(member)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              title="تعديل بيانات المشترك"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(member)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
              title="حذف المشترك (خاص بالإدارة)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Staff badge if available */}
        {member.createdBy && (
          <span className="text-[9px] text-slate-400 truncate max-w-[100px]" title={`مسجل بواسطة: ${member.createdBy}`}>
            بواسطة: {member.createdBy}
          </span>
        )}

        {/* Renew Subscription Action Button */}
        {canRenew && (
          <button
            id={`btn-renew-${member.id}`}
            onClick={() => onRenew(member)}
            className={`text-[10px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all cursor-pointer ${
              status === 'expired'
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <RotateCw className="w-3 h-3" />
            <span>تجديد الاشتراك</span>
          </button>
        )}
      </div>

    </div>
  );
};
