import React, { useMemo, useState } from 'react';
import { Subscription, ExchangeRate } from '../types';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  subscriptions: Subscription[];
  exchangeRate: ExchangeRate;
  onAddClick: () => void;
  onSelectSubscription: (sub: Subscription) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Media: '#EF4444', // Red
  AI: '#3B82F6', // Blue
  Development: '#10B981', // Green
  Design: '#F59E0B', // Amber
  Productivity: '#8B5CF6', // Purple
  Storage: '#6B7280', // Gray
  Other: '#9CA3AF'
};

const Dashboard: React.FC<DashboardProps> = ({ subscriptions, exchangeRate, onAddClick, onSelectSubscription }) => {
  const { user } = useAuth();
  const userCurrency = user?.settings.currency || 'KRW';

  const convertPrice = (price: number, currency: string) => {
    if (currency === userCurrency) return price;
    if (userCurrency === 'KRW' && currency === 'USD') return price * exchangeRate.rate;
    if (userCurrency === 'USD' && currency === 'KRW') return price / exchangeRate.rate;
    return price;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(userCurrency === 'KRW' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency: userCurrency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stats = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    
    let totalMonthly = 0;
    let dueTomorrow = 0;
    let nextBillingCount = 0;
    
    // Category Breakdown Data
    const categoryTotals: Record<string, number> = {};

    // Calculate Totals and Categories
    subscriptions.forEach(sub => {
      if (sub.status !== 'active') return;

      let amount = convertPrice(sub.price, sub.currency);
      if (sub.billing_cycle === 'yearly') amount /= 12;

      totalMonthly += amount;

      // Category Sum
      if (!categoryTotals[sub.category]) categoryTotals[sub.category] = 0;
      categoryTotals[sub.category] += amount;

      // Tomorrow count
      const tomorrowDay = new Date(Date.now() + 86400000).getDate();
      if (sub.billing_date === tomorrowDay) {
        dueTomorrow += amount;
        nextBillingCount++;
      }
    });

    // Chart Data
    const chartData = Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: categoryTotals[cat],
      color: CATEGORY_COLORS[cat] || CATEGORY_COLORS['Other']
    })).sort((a, b) => b.value - a.value);

    // Find Next Payment (After Tomorrow)
    const sortedSubs = [...subscriptions].filter(s => s.status === 'active').sort((a, b) => a.billing_date - b.billing_date);
    const tomorrowDay = new Date(Date.now() + 86400000).getDate();
    
    let nextSub = sortedSubs.find(s => s.billing_date > tomorrowDay);
    if (!nextSub && sortedSubs.length > 0) {
      nextSub = sortedSubs[0];
    }
    
    let nextPaymentDate = new Date();
    if (nextSub) {
      if (nextSub.billing_date <= currentDay) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      nextPaymentDate.setDate(nextSub.billing_date);
    }

    const nextPaymentAmount = nextSub ? convertPrice(nextSub.price, nextSub.currency) : 0;
    
    const tmrDate = new Date();
    tmrDate.setDate(tmrDate.getDate() + 1);

    return { 
      totalMonthly, 
      dueTomorrow, 
      nextBillingCount, 
      chartData,
      nextSub,
      nextPaymentAmount,
      nextPaymentDate,
      tmrDate
    };
  }, [subscriptions, exchangeRate, userCurrency]);

  return (
    <div className="px-6 space-y-6">
      
      {/* Hero Text */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-text leading-tight">
          이번 달 결제 예정<br />
          <span className="text-primary">{stats.nextBillingCount}건</span>이 남아있어요
        </h1>
      </div>

      {/* Main Stats Card (Pie Chart) */}
      <div className="bg-white rounded-3xl p-6 shadow-soft relative overflow-hidden flex justify-between items-center">
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-subtext">
             <p className="text-xs font-bold">총 예상 지출 (월)</p>
          </div>
          <h2 className="text-3xl font-extrabold text-text tracking-tight mb-2">
            {formatCurrency(stats.totalMonthly)}
          </h2>
          <div className="space-y-1">
            {stats.chartData.slice(0, 2).map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-xs text-subtext font-medium truncate max-w-[100px]">{entry.name} {Math.round((entry.value / stats.totalMonthly) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-28 h-28 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.chartData}
                innerRadius={35}
                outerRadius={50}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {stats.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <span className="text-[10px] font-bold text-gray-400">비율</span>
          </div>
        </div>
      </div>

      {/* Upcoming Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tomorrow Card */}
        <div className="bg-white rounded-[24px] p-5 shadow-soft flex flex-col justify-between h-36 border border-transparent hover:border-blue-100 transition-colors">
           <div className="flex justify-between items-start">
             <span className="text-subtext font-bold text-xs">내일 결제</span>
             <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                {stats.tmrDate.getDate()}일
             </span>
           </div>
           <div>
             <p className="text-lg font-bold text-text mt-0.5">{formatCurrency(stats.dueTomorrow)}</p>
           </div>
        </div>

        {/* Next Payment Card */}
        <div 
           onClick={() => stats.nextSub && onSelectSubscription(stats.nextSub)}
           className={`bg-white rounded-[24px] p-5 shadow-soft flex flex-col justify-between h-36 border border-transparent transition-colors ${stats.nextSub ? 'cursor-pointer active:scale-95 hover:border-purple-100' : ''}`}
        >
           <div className="flex justify-between items-start">
             <span className="text-subtext font-bold text-xs">다음 결제</span>
             {stats.nextSub && (
               <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  {stats.nextPaymentDate.getDate()}일
               </span>
             )}
           </div>
           <div>
             {stats.nextSub ? (
               <>
                 <p className="text-xs text-primary font-bold mb-0.5 truncate max-w-full">{stats.nextSub.service_name}</p>
                 <p className="text-lg font-bold text-gray-500">{formatCurrency(stats.nextPaymentAmount)}</p>
               </>
             ) : (
               <p className="text-sm text-gray-400 font-medium">예정 없음</p>
             )}
           </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-text">내 구독 서비스</h3>
          <button onClick={onAddClick} className="text-xs font-bold text-primary bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
            + 추가하기
          </button>
        </div>

        <div className="space-y-3 pb-8">
          {subscriptions.map((sub) => {
             const price = convertPrice(sub.price, sub.currency);
             const today = new Date().getDate();
             const isToday = sub.billing_date === today;
             const isTomorrow = sub.billing_date === today + 1;
             
             return (
               <div 
                  key={sub.id} 
                  onClick={() => onSelectSubscription(sub)}
                  className="bg-white rounded-2xl p-4 shadow-soft flex items-center justify-between active:scale-98 transition-transform cursor-pointer border border-transparent hover:border-gray-100 group"
               >
                  <div className="flex items-center gap-4">
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
                         <div className={`absolute inset-0 flex items-center justify-center text-white text-xl font-bold ${sub.logo_url ? '-z-10' : ''}`} style={{ backgroundColor: sub.color || '#1F2937' }}>
                            {sub.service_name[0]}
                         </div>
                     </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-text truncate">{sub.service_name}</h4>
                      <p className="text-xs text-subtext font-medium mt-0.5">
                        {formatCurrency(price)} / {sub.billing_cycle === 'monthly' ? '월' : '년'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isToday ? (
                       <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">오늘 결제</span>
                    ) : isTomorrow ? (
                       <span className="px-3 py-1 bg-blue-100 text-primary text-xs font-bold rounded-full">내일 결제</span>
                    ) : (
                       <div className="text-right">
                         <span className="block text-xs font-bold text-gray-400">{sub.billing_date}일</span>
                         <span className="text-[10px] text-gray-300">결제일</span>
                       </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
               </div>
             );
          })}
          
          {subscriptions.length === 0 && (
             <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-400 text-sm">등록된 구독 서비스가 없어요</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;