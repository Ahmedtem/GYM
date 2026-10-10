import React from 'react';
import { 
  Phone, 
  RotateCw, 
  History, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  Gift, 
  Sparkles,
  Calendar
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

interface MemberTableProps {
  members: Member[];
  canDelete?: boolean;
  canEdit?: boolean;
  canRenew?: boolean;
  onRenew: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onShowHistory: (member: Member) => void;
  onAwardLoyaltyGift: (member: Member) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  canDelete = true,
  canEdit = true,
  canRenew = true,
  onRenew,
  onEdit,
  onDelete,
  onShowHistory,
  onAwardLoyaltyGift,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-right text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <th scope="col" className="p-3 border-b border-slate-200">المشترك</th>
              <th scope="col" className="p-3 border-b border-slate-200">الهاتف</th>
              <th scope="col" className="p-3 border-b border-slate-200">نوع الاشتراك</th>
              <th scope="col" className="p-3 border-b border-slate-200">بداية الاشتراك</th>
              <th scope="col" className="p-3 border-b border-slate-200">نهاية الاشتراك</th>
              <th scope="col" className="p-3 border-b border-slate-200 text-center">القيمة</th>
              <th scope="col" className="p-3 border-b border-slate-200">الحالة</th>
              <th scope="col" className="p-3 border-b border-slate-200">برنامج الولاء (٦ أشهر) 🎁</th>
              <th scope="col" className="p-3 border-b border-slate-200 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => {
              const { status, label } = getSubscriptionStatus(member.endDate);
              const loyalty = getLoyaltyProgress(member);
              const plan = getPlanById(member.planType, member.durationMonths);
              const expiryMsg = generateExpiryMessage(member);
              const loyaltyMsg = generateLoyaltyGiftMessage(member);

              return (
                <tr 
                  key={member.id} 
                  id={`member-row-${member.id}`}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    loyalty.isEligible 
                      ? 'bg-purple-50/20' 
                      : status === 'expired' 
                      ? 'bg-rose-50/30' 
                      : ''
                  }`}
                >
                  {/* Name */}
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        loyalty.isEligible
                          ? 'bg-purple-600 text-white'
                          : member.gender === 'female'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {member.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <span>{member.name}</span>
                          {loyalty.isEligible && (
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                          )}
                        </div>
                        {member.notes && (
                          <div className="text-[10px] text-slate-400 max-w-[150px] truncate">
                            {member.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Phone with WhatsApp shortcut */}
                  <td className="p-3 whitespace-nowrap text-slate-600">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${member.phone}`}
                        className="text-slate-600 hover:text-blue-600 font-medium"
                        dir="ltr"
                      >
                        {member.phone}
                      </a>
                      <a
                        href={getWhatsAppLink(member.phone, expiryMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded"
                        title="إرسال رسالة واتساب"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>

                  {/* Subscription Plan */}
                  <td className="p-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${plan.badgeBg} ${plan.badgeText} ${plan.badgeBorder}`}>
                      <span>{plan.icon}</span>
                      <span>{plan.name}</span>
                      <span className="text-[9px] opacity-75 font-normal">({plan.tag})</span>
                    </span>
                  </td>

                  {/* Start Date */}
                  <td className="p-3 whitespace-nowrap text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatArabicDate(member.startDate)}</span>
                    </div>
                  </td>

                  {/* End Date */}
                  <td className="p-3 whitespace-nowrap">
                    <div className={`font-semibold flex items-center gap-1 ${
                      status === 'expired' 
                        ? 'text-rose-600' 
                        : status === 'expiring_soon' 
                        ? 'text-amber-600' 
                        : 'text-slate-700'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      <span>{formatArabicDate(member.endDate)}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="p-3 whitespace-nowrap text-center font-bold text-slate-800">
                    {formatCurrency(member.amount)}
                  </td>

                  {/* Status badge matching High Density theme */}
                  <td className="p-3 whitespace-nowrap">
                    {status === 'expired' ? (
                      <span className="bg-rose-600 text-white px-2 py-1 rounded-md text-[10px] font-bold">
                        منتهي
                      </span>
                    ) : status === 'expiring_soon' ? (
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold">
                        قريباً
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold">
                        نشط
                      </span>
                    )}
                  </td>

                  {/* Loyalty 6-Month Status */}
                  <td className="p-3 whitespace-nowrap">
                    {loyalty.isEligible ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAwardLoyaltyGift(member)}
                          className="bg-amber-400 hover:bg-amber-500 text-amber-950 text-[10px] px-2.5 py-1 rounded font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-transform active:scale-95"
                          title="تسليم هدية إتمام ٦ أشهر متتالية"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>هدية ولاء (٦ أشهر) 🎁</span>
                        </button>
                        <a
                          href={getWhatsAppLink(member.phone, loyaltyMsg)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-emerald-600 hover:text-emerald-700 rounded"
                          title="تهنئة بالهدية عبر واتساب"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-purple-600"
                            style={{ width: `${loyalty.percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {member.consecutiveMonths} / 6 شهور
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Quick renew */}
                      {canRenew && (
                        <button
                          onClick={() => onRenew(member)}
                          className={`text-[10px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                            status === 'expired'
                              ? 'bg-rose-500 hover:bg-rose-600 text-white'
                              : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
                          }`}
                          title="تجديد الاشتراك"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>تجديد</span>
                        </button>
                      )}

                      {/* History */}
                      <button
                        onClick={() => onShowHistory(member)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="سجل الاشتراكات والهدايا"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      {canEdit && (
                        <button
                          onClick={() => onEdit(member)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="تعديل بيانات المشترك"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete (Admin only) */}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(member)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="حذف المشترك (خاص بالإدارة)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
