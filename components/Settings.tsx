import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, Plus, Trash2, ChevronDown, ChevronUp, CreditCard, LogOut } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updateSettings, logout, addPaymentMethod, removePaymentMethod } = useAuth();
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isPaymentExpanded, setIsPaymentExpanded] = useState(false);

  if (!user) return null;

  const handleAddPayment = () => {
    if (newPaymentMethod.trim()) {
      addPaymentMethod(newPaymentMethod.trim());
      setNewPaymentMethod('');
      setIsAddingPayment(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) {
        logout();
    }
  };

  return (
    <div className="px-6 pt-6 h-full bg-[#F2F4F6]">
      <h1 className="text-2xl font-bold text-text mb-6">설정</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-3xl p-5 mb-6 flex items-center gap-4 shadow-sm border border-gray-100">
         <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
         </div>
         <div>
            <h2 className="text-lg font-bold text-text">{user.name}</h2>
            <p className="text-sm text-subtext">{user.email}</p>
         </div>
      </div>

      <div className="space-y-6 pb-32">
        
        {/* Payment Methods (Collapsible) */}
        <div>
          <h3 className="text-xs font-bold text-subtext mb-2 px-2">결제 수단 관리</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300">
            
            {/* Header (Always Visible) */}
            <div 
                onClick={() => setIsPaymentExpanded(!isPaymentExpanded)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-primary">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block font-bold text-text text-sm">등록된 결제 수단</span>
                        {!isPaymentExpanded && (
                            <span className="text-xs text-subtext">{user.paymentMethods.length}개 등록됨</span>
                        )}
                    </div>
                </div>
                {isPaymentExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </div>

            {/* Expanded Content */}
            {isPaymentExpanded && (
                <div className="border-t border-gray-50 animate-slide-down">
                    {user.paymentMethods.map((method, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 pl-5 border-b border-gray-50 last:border-0 bg-gray-50/50">
                        <span className="font-bold text-text text-sm">{method}</span>
                        <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            removePaymentMethod(method);
                        }}
                        className="text-gray-300 hover:text-red-500 p-2"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    ))}
                    
                    {isAddingPayment ? (
                    <div className="p-4 flex gap-2 bg-white">
                        <input 
                        type="text" 
                        value={newPaymentMethod}
                        onChange={(e) => setNewPaymentMethod(e.target.value)}
                        placeholder="예: 우리카드"
                        className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none border border-gray-200 focus:border-primary"
                        autoFocus
                        />
                        <button 
                        onClick={handleAddPayment}
                        className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold"
                        >
                        추가
                        </button>
                        <button 
                        onClick={() => setIsAddingPayment(false)}
                        className="text-gray-400 px-2"
                        >
                        취소
                        </button>
                    </div>
                    ) : (
                    <button 
                        onClick={() => setIsAddingPayment(true)}
                        className="w-full p-4 flex items-center justify-center gap-2 text-primary font-bold text-sm hover:bg-blue-50 transition-colors bg-white"
                    >
                        <Plus className="w-4 h-4" />
                        결제 수단 추가하기
                    </button>
                    )}
                </div>
            )}
          </div>
        </div>

        {/* App Settings Group */}
        <div>
          <h3 className="text-xs font-bold text-subtext mb-2 px-2">앱 설정</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            
            {/* Notifications */}
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <span className="font-bold text-text text-sm pl-1">알림 수신</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={user.settings.notifications}
                  onChange={(e) => updateSettings({ notifications: e.target.checked })}
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Currency */}
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
               <span className="font-bold text-text text-sm pl-1">표시 통화</span>
               <div className="flex bg-gray-100 p-0.5 rounded-lg">
                  <button 
                    onClick={() => updateSettings({ currency: 'KRW' })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${user.settings.currency === 'KRW' ? 'bg-white shadow-sm text-text' : 'text-gray-400'}`}
                  >KRW</button>
                  <button 
                    onClick={() => updateSettings({ currency: 'USD' })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${user.settings.currency === 'USD' ? 'bg-white shadow-sm text-text' : 'text-gray-400'}`}
                  >USD</button>
               </div>
            </div>

            {/* Language (Mock) */}
            <div className="flex items-center justify-between p-5">
               <span className="font-bold text-text text-sm pl-1">언어</span>
               <div className="flex items-center gap-2 text-subtext text-xs font-medium">
                  한국어
                  <ChevronRight className="w-4 h-4" />
               </div>
            </div>

          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-4 pt-4">
           <button 
             onClick={logout}
             className="w-full bg-white rounded-3xl p-4 flex items-center justify-center gap-2 shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
           >
              <LogOut className="w-4 h-4" />
              <span className="font-bold text-sm">로그아웃</span>
           </button>
           
           <button 
             onClick={handleDeleteAccount}
             className="w-full bg-white rounded-3xl p-4 flex items-center justify-center gap-2 shadow-sm border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
           >
              <Trash2 className="w-4 h-4" />
              <span className="font-bold text-sm">회원 탈퇴</span>
           </button>
        </div>

        <div className="text-center pt-2">
           <p className="text-[10px] text-gray-300">SubTracker v1.2.0</p>
        </div>

      </div>
    </div>
  );
};

export default Settings;