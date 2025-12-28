import React, { useState, useEffect } from 'react';
import { X, Wand2, Loader2, Check } from 'lucide-react';
import { Subscription, Category, Currency, BillingCycle, ServiceTemplate } from '../types';
import { parseSubscriptionText } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

// Predefined templates for popular services
const POPULAR_SERVICES: ServiceTemplate[] = [
  {
    name: "Netflix",
    domain: "netflix.com",
    category: "Media",
    color: "#E50914",
    plans: [
      { name: "Standard (광고형)", price: 5500, currency: "KRW", billing_cycle: "monthly" },
      { name: "Standard", price: 13500, currency: "KRW", billing_cycle: "monthly" },
      { name: "Premium", price: 17000, currency: "KRW", billing_cycle: "monthly" }
    ]
  },
  {
    name: "YouTube",
    domain: "youtube.com",
    category: "Media",
    color: "#FF0000",
    plans: [
      { name: "Premium (개인)", price: 14900, currency: "KRW", billing_cycle: "monthly" }
    ]
  },
  {
    name: "Spotify",
    domain: "spotify.com",
    category: "Media",
    color: "#1DB954",
    plans: [
      { name: "개인", price: 10900, currency: "KRW", billing_cycle: "monthly" },
      { name: "듀오", price: 16350, currency: "KRW", billing_cycle: "monthly" }
    ]
  },
  {
    name: "ChatGPT",
    domain: "openai.com",
    category: "AI",
    color: "#10A37F",
    plans: [
      { name: "Plus", price: 20, currency: "USD", billing_cycle: "monthly" }
    ]
  },
  {
    name: "Claude",
    domain: "anthropic.com",
    category: "AI",
    color: "#D97757",
    plans: [
      { name: "Pro", price: 20, currency: "USD", billing_cycle: "monthly" }
    ]
  },
  {
    name: "Coupang",
    domain: "coupang.com",
    category: "Other",
    color: "#342207",
    plans: [
      { name: "Wow 멤버십", price: 7890, currency: "KRW", billing_cycle: "monthly" }
    ]
  },
  {
    name: "Naver",
    domain: "naver.com",
    category: "Other",
    color: "#03C75A",
    plans: [
      { name: "네이버플러스", price: 4900, currency: "KRW", billing_cycle: "monthly" }
    ]
  }
];

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sub: Omit<Subscription, 'id'>) => void;
  initialData?: Subscription | null;
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({ isOpen, onClose, onAdd, initialData }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);

  const [formData, setFormData] = useState({
    service_name: '',
    category: 'Other' as Category,
    plan_name: '',
    price: 0,
    currency: 'KRW' as Currency,
    billing_cycle: 'monthly' as BillingCycle,
    billing_date: 1,
    payment_method: '',
    color: '',
    logo_url: ''
  });

  useEffect(() => {
    if (initialData) {
      setMode('manual');
      setSelectedTemplate(null);
      setFormData({
        service_name: initialData.service_name,
        category: initialData.category,
        plan_name: initialData.plan_name,
        price: initialData.price,
        currency: initialData.currency,
        billing_cycle: initialData.billing_cycle,
        billing_date: initialData.billing_date,
        payment_method: initialData.payment_method || '',
        color: initialData.color || '',
        logo_url: initialData.logo_url || ''
      });
    } else {
      setMode('manual'); // Default to manual for easier template access
      setSelectedTemplate(null);
      setFormData({
        service_name: '',
        category: 'Other',
        plan_name: '',
        price: 0,
        currency: 'KRW',
        billing_cycle: 'monthly',
        billing_date: new Date().getDate(),
        payment_method: user?.paymentMethods[0] || '',
        color: '',
        logo_url: ''
      });
    }
  }, [initialData, isOpen, user]);

  const applyTemplate = (template: ServiceTemplate) => {
    setSelectedTemplate(template);
    
    // Default to first plan
    const defaultPlan = template.plans[0];
    
    setFormData(prev => ({
      ...prev,
      service_name: template.name,
      category: template.category,
      plan_name: defaultPlan.name,
      price: defaultPlan.price,
      currency: defaultPlan.currency,
      billing_cycle: defaultPlan.billing_cycle,
      color: template.color,
      logo_url: `https://logo.clearbit.com/${template.domain}`
    }));
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedTemplate) return;
    const plan = selectedTemplate.plans.find(p => p.name === e.target.value);
    if (plan) {
      setFormData(prev => ({
        ...prev,
        plan_name: plan.name,
        price: plan.price,
        currency: plan.currency,
        billing_cycle: plan.billing_cycle
      }));
    } else {
       // Custom input handling if needed
       setFormData(prev => ({ ...prev, plan_name: e.target.value }));
    }
  };

  if (!isOpen) return null;

  const handleAiAnalyze = async () => {
    if (!aiInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await parseSubscriptionText(aiInput);
      setFormData(prev => ({
        ...prev,
        ...result,
        price: result.price || 0,
        billing_date: new Date().getDate(),
        currency: result.currency || 'KRW',
        payment_method: user?.paymentMethods[0] || '',
        logo_url: '' // Reset logo if AI is used
      }));
      setMode('manual'); 
    } catch (e) {
      alert("분석에 실패했습니다. 직접 입력해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextDate = new Date();
    if (nextDate.getDate() > formData.billing_date) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    nextDate.setDate(formData.billing_date);

    onAdd({
      ...formData,
      next_billing_date: nextDate.toISOString(),
      status: 'active',
      notes: mode === 'ai' ? `AI 자동 입력: "${aiInput}"` : (initialData?.notes || '')
    });
    
    setAiInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden transform transition-all animate-slide-up max-h-[92vh] flex flex-col">
        
        <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        <div className="px-6 pb-6 pt-2 flex-1 overflow-y-auto hide-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">{initialData ? '구독 정보 수정' : '구독 추가하기'}</h3>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!initialData && (
            <div className="mb-6 flex p-1 bg-gray-100 rounded-xl h-12 shrink-0">
               <button
                  onClick={() => setMode('manual')}
                  className={`flex-1 flex items-center justify-center text-sm font-bold rounded-lg transition-all h-full ${
                    mode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  직접 입력
                </button>
                <button
                  onClick={() => setMode('ai')}
                  className={`flex-1 flex items-center justify-center text-sm font-bold rounded-lg transition-all h-full ${
                    mode === 'ai' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Wand2 className="w-4 h-4 mr-1.5" />
                  AI 자동 입력
                </button>
            </div>
          )}

          {mode === 'manual' && !initialData && (
             <div className="mb-6">
               <label className="block text-xs font-bold text-gray-500 mb-2.5 ml-1">인기 서비스 빠른 선택</label>
               <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                 {POPULAR_SERVICES.map(template => (
                   <button
                     key={template.name}
                     onClick={() => applyTemplate(template)}
                     className={`flex flex-col items-center gap-2 min-w-[70px] p-2 rounded-xl border transition-all ${
                       formData.service_name === template.name ? 'border-primary bg-blue-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                     }`}
                   >
                     <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border border-gray-100">
                        <img 
                          src={`https://logo.clearbit.com/${template.domain}`} 
                          alt={template.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                             (e.target as HTMLImageElement).src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; 
                          }}
                        />
                     </div>
                     <span className={`text-[10px] font-bold ${formData.service_name === template.name ? 'text-primary' : 'text-gray-600'}`}>
                       {template.name}
                     </span>
                   </button>
                 ))}
               </div>
             </div>
          )}

          {mode === 'ai' && !initialData ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl text-sm text-blue-700 leading-relaxed">
                <span className="font-bold block mb-1">💡 팁</span>
                "넷플릭스 프리미엄 17,000원 매월 결제"<br/>
                "ChatGPT Plus 20달러" 처럼 입력해보세요.
              </div>
              
              <textarea
                className="w-full rounded-2xl border border-gray-200 p-4 text-base focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none bg-gray-50 focus:bg-white min-h-[120px]"
                rows={4}
                placeholder="여기에 내용을 입력하세요..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />

              <button
                onClick={handleAiAnalyze}
                disabled={isAnalyzing || !aiInput.trim()}
                className="w-full flex justify-center items-center rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-600 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    분석하고 채우기
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">서비스 이름</label>
                <div className="relative">
                    <input
                      type="text"
                      required
                      className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all pl-4"
                      value={formData.service_name}
                      onChange={e => setFormData({ ...formData, service_name: e.target.value })}
                      placeholder="예: 넷플릭스"
                    />
                    {formData.logo_url && (
                       <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full overflow-hidden border border-gray-100">
                          <img src={formData.logo_url} alt="logo" className="w-full h-full object-cover" />
                       </div>
                    )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">플랜 이름</label>
                  {selectedTemplate ? (
                     <select 
                       className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none appearance-none truncate"
                       value={formData.plan_name}
                       onChange={handlePlanChange}
                     >
                        {selectedTemplate.plans.map(p => (
                           <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                     </select>
                  ) : (
                    <input
                      type="text"
                      className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                      value={formData.plan_name}
                      onChange={e => setFormData({ ...formData, plan_name: e.target.value })}
                      placeholder="예: 프리미엄"
                    />
                  )}
                </div>
                 <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">카테고리</label>
                  <select
                    className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                  >
                    <option value="Media">미디어</option>
                    <option value="AI">AI</option>
                    <option value="Development">개발</option>
                    <option value="Design">디자인</option>
                    <option value="Productivity">생산성</option>
                    <option value="Storage">스토리지</option>
                    <option value="Other">기타</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">가격</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">통화</label>
                  <div className="flex bg-gray-100 p-1 rounded-2xl h-[52px]">
                     <button
                       type="button"
                       onClick={() => setFormData({...formData, currency: 'KRW'})}
                       className={`flex-1 text-sm font-bold rounded-xl transition-all h-full ${formData.currency === 'KRW' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                     >₩</button>
                     <button
                       type="button"
                       onClick={() => setFormData({...formData, currency: 'USD'})}
                       className={`flex-1 text-sm font-bold rounded-xl transition-all h-full ${formData.currency === 'USD' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                     >$</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">결제 수단</label>
                  <select
                    className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                    value={formData.payment_method}
                    onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="" disabled>선택</option>
                    {user?.paymentMethods.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                 <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">결제일 (일)</label>
                  <input
                      type="number"
                      min="1"
                      max="31"
                      required
                      className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                      value={formData.billing_date}
                      onChange={e => setFormData({ ...formData, billing_date: parseInt(e.target.value) })}
                    />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all mt-4 active:scale-[0.98]"
              >
                {initialData ? '수정 완료' : '저장하기'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSubscriptionModal;