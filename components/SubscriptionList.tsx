import React, { useState } from 'react';
import { Subscription, ExchangeRate } from '../types';
import { ChevronRight, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  exchangeRate: ExchangeRate;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
  onSelectSubscription: (sub: Subscription) => void;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ subscriptions, exchangeRate, onDelete, onOpenAddModal, onSelectSubscription }) => {
  const { user } = useAuth();
  const userCurrency = user?.settings.currency || 'KRW';
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number, currency: string) => {
    let val = amount;
    if (currency !== userCurrency) {
       if (userCurrency === 'KRW') val = amount * exchangeRate.rate;
       else val = amount / exchangeRate.rate;
    }
    return new Intl.NumberFormat(userCurrency === 'KRW' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency: userCurrency,
      maximumFractionDigits: 0
    }).format(val);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`${selectedIds.size}개의 구독을 삭제하시겠습니까?`)) {
      selectedIds.forEach(id => onDelete(id));
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    }
  };

  const toggleAll = () => {
      if (selectedIds.size === subscriptions.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(subscriptions.map(s => s.id)));
      }
  };

  return (
    <div className="px-6 h-full flex flex-col pt-6 relative">
      <div className="pb-6 flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-text mb-1">전체 목록</h2>
            <p className="text-sm text-subtext">관리 중인 구독 서비스 {subscriptions.length}개</p>
        </div>
        <button 
            onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds(new Set());
            }}
            className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${isSelectionMode ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
            {isSelectionMode ? '완료' : '편집'}
        </button>
      </div>
      
      {isSelectionMode && subscriptions.length > 0 && (
           <div className="mb-4 flex justify-between items-center">
               <button onClick={toggleAll} className="text-xs font-bold text-gray-500 flex items-center gap-1.5 pl-1">
                   {selectedIds.size === subscriptions.length ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4" />}
                   전체 선택
               </button>
               {selectedIds.size > 0 && (
                   <span className="text-xs font-bold text-primary">{selectedIds.size}개 선택됨</span>
               )}
           </div>
      )}

      <div className="flex-1 space-y-4 pb-20">
        {subscriptions.map((sub) => (
            <div 
              key={sub.id} 
              onClick={() => {
                  if (isSelectionMode) toggleSelection(sub.id);
                  else onSelectSubscription(sub);
              }}
              className={`bg-white rounded-3xl p-5 shadow-soft flex items-center justify-between group active:scale-98 transition-all cursor-pointer border ${selectedIds.has(sub.id) && isSelectionMode ? 'border-primary ring-1 ring-primary' : 'border-transparent'}`}
            >
              <div className="flex items-center gap-4 w-full">
                
                {isSelectionMode && (
                    <div className="shrink-0 transition-all">
                        {selectedIds.has(sub.id) ? (
                            <CheckCircle2 className="w-6 h-6 text-primary fill-blue-50" />
                        ) : (
                            <Circle className="w-6 h-6 text-gray-300" />
                        )}
                    </div>
                )}

                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 overflow-hidden border border-gray-100 relative shadow-sm shrink-0">
                     {sub.logo_url ? (
                         <img 
                           src={sub.logo_url} 
                           alt={sub.service_name} 
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             e.currentTarget.style.display = 'none';
                             e.currentTarget.parentElement?.classList.add('fallback-icon');
                           }}
                         />
                     ) : null}
                     <div className={`absolute inset-0 flex items-center justify-center text-white text-lg font-bold ${sub.logo_url ? '-z-10' : ''}`} style={{ backgroundColor: sub.color || '#1F2937' }}>
                        {sub.service_name.charAt(0)}
                     </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-text text-lg truncate">{sub.service_name}</h3>
                  <div className="flex items-center gap-1 text-sm text-subtext font-medium mt-0.5">
                     <span>{formatCurrency(sub.price, sub.currency)}</span>
                     <span className="text-xs">/ {sub.billing_cycle === 'monthly' ? '월' : '년'}</span>
                  </div>
                </div>
                
                {!isSelectionMode && (
                    <div className="text-right shrink-0">
                        <span className="block text-xs font-bold text-gray-400">
                            {sub.billing_cycle === 'monthly' ? `매월 ${sub.billing_date}일` : `매년 ${sub.billing_date}일`}
                        </span>
                        <span className="text-[10px] text-gray-300">결제일</span>
                    </div>
                )}
              </div>
            </div>
        ))}

        {!isSelectionMode && (
            <button 
            onClick={onOpenAddModal}
            className="w-full py-5 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-primary hover:text-primary hover:bg-blue-50/50 transition-all"
            >
            <Plus className="w-5 h-5" />
            새 구독 서비스 추가
            </button>
        )}
      </div>

      {/* Floating Action for Bulk Delete */}
      {isSelectionMode && (
          <div className="fixed bottom-[110px] left-0 right-0 max-w-[430px] mx-auto px-6 z-50 animate-slide-up">
              <button 
                  onClick={handleBulkDelete}
                  disabled={selectedIds.size === 0}
                  className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                  <Trash2 className="w-5 h-5" />
                  {selectedIds.size}개 삭제하기
              </button>
          </div>
      )}
    </div>
  );
};

export default SubscriptionList;