import React from 'react';
import { ChevronLeft, CreditCard, Calendar, Edit2, ExternalLink, Trash2 } from 'lucide-react';
import { Subscription } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionDetailProps {
  subscription: Subscription;
  onBack: () => void;
  onDelete: (id: string) => void;
  onEdit: (sub: Subscription) => void;
}

const SubscriptionDetail: React.FC<SubscriptionDetailProps> = ({ subscription, onBack, onDelete, onEdit }) => {
  const { user } = useAuth();
  const nextBilling = new Date(subscription.next_billing_date);
  const formattedDate = nextBilling.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

  const handleExternalUnsubscribe = () => {
    // Open Google Search for cancellation if no specific URL (generic fallback)
    const query = `${subscription.service_name} 해지 방법`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm(`'${subscription.service_name}' 서비스를 목록에서 삭제하시겠습니까?\n실제 구독 해지는 되지 않습니다.`)) {
        onDelete(subscription.id);
    }
  };

  return (
    <div className="bg-white h-screen overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between bg-white sticky top-0 z-20 border-b border-gray-50">
        <button 
          onClick={onBack}
          className="w-10 h-10 -ml-2 flex items-center justify-center text-text hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-bold text-text">상세 정보</span>
        <button 
          onClick={() => onEdit(subscription)}
          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-blue-50 rounded-full transition-colors"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 space-y-8 pb-20 pt-6">
        
        {/* Hero Section */}
        <div className="text-center">
           <div className="w-24 h-24 rounded-[32px] mx-auto flex items-center justify-center bg-gray-50 overflow-hidden border border-gray-100 relative shadow-xl shadow-gray-200 mb-6">
                {subscription.logo_url ? (
                     <img 
                       src={subscription.logo_url} 
                       alt={subscription.service_name} 
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         e.currentTarget.style.display = 'none';
                         e.currentTarget.parentElement?.classList.add('fallback-icon');
                       }}
                     />
                 ) : null}
                 <div className={`absolute inset-0 flex items-center justify-center text-white text-4xl font-bold ${subscription.logo_url ? '-z-10' : ''}`} style={{ backgroundColor: subscription.color || '#1F2937' }}>
                    {subscription.service_name[0]}
                 </div>
           </div>
           <h1 className="text-2xl font-bold text-text">{subscription.service_name}</h1>
           <p className="text-subtext font-medium mt-1">{subscription.plan_name} 플랜</p>
        </div>

        {/* Info Card */}
        <div className="bg-gray-50 rounded-[28px] p-6 space-y-6 border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-subtext font-medium text-sm">구독료</span>
              <span className="text-xl font-bold text-text">
                {subscription.currency === 'USD' ? '$' : '₩'}
                {subscription.price.toLocaleString()}
              </span>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-between items-center">
              <span className="text-subtext font-medium text-sm">결제 주기</span>
              <span className="text-text font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                {subscription.billing_cycle === 'monthly' ? '매월 결제' : '매년 결제'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-primary" />
                 <span className="text-subtext font-medium text-sm">다음 결제일</span>
              </div>
              <span className="text-primary font-bold">{formattedDate}</span>
            </div>
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="text-base font-bold text-text mb-3 px-1">결제 수단</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 rounded-lg text-primary">
                 <CreditCard className="w-5 h-5" />
               </div>
               <span className="font-semibold text-text text-sm">
                 {subscription.payment_method || '선택된 결제 수단 없음'}
               </span>
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
           {/* Unsubscribe External Link */}
           <button 
              onClick={handleExternalUnsubscribe}
              className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
           >
             <ExternalLink className="w-4 h-4" />
             구독 해지하러 가기
           </button>

           <div className="text-center pt-2">
             <button 
                onClick={handleDelete}
                className="w-full py-4 rounded-2xl bg-white border border-red-100 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
             >
                <Trash2 className="w-4 h-4" />
                목록에서 삭제
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetail;