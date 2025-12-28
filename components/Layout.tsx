import React, { useEffect } from 'react';
import { Home, List, Settings, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user } = useAuth();
  const [showNotification, setShowNotification] = React.useState(false);

  // Notification Demo
  useEffect(() => {
    if (user?.settings.notifications) {
      const timer = setTimeout(() => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 4000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user?.settings.notifications]);

  return (
    <div className="flex h-screen bg-[#F2F4F6] text-gray-900 font-sans overflow-hidden max-w-[430px] mx-auto relative shadow-2xl border-x border-gray-200">
      
      {/* Mobile Notification Popup */}
      <div 
        className={`absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-float p-4 z-[110] transform transition-all duration-500 ease-in-out flex items-start gap-3 border border-white/20 ${
          showNotification ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0'
        }`}
      >
        <div className="bg-primaryLight p-2 rounded-xl">
           <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
           <h4 className="font-bold text-sm text-gray-900">결제 예정 알림</h4>
           <p className="text-xs text-subtext mt-0.5">내일 넷플릭스 결제가 예정되어 있어요.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 hide-scrollbar bg-[#F2F4F6]">
        {/* Header Spacer for spacing only */}
        <div className="pt-8 px-6 pb-2"></div>
        
        {children}
      </main>

      {/* Bottom Tab Bar (Soft Design) */}
      <nav className="absolute bottom-0 left-0 right-0 h-[90px] bg-white rounded-t-[24px] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] flex justify-around items-start pt-4 z-40 pb-safe">
        
        <button 
           onClick={() => onTabChange('subscriptions')}
           className={`flex-1 flex flex-col items-center justify-center gap-1.5 group active:scale-95 transition-transform`}
        >
           <div className={`transition-all duration-300 ${activeTab === 'subscriptions' ? 'text-gray-900 -translate-y-1' : 'text-gray-300'}`}>
             <List className={`w-6 h-6 ${activeTab === 'subscriptions' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
           </div>
           <span className={`text-[10px] font-bold transition-colors ${activeTab === 'subscriptions' ? 'text-gray-900' : 'text-gray-300'}`}>목록</span>
        </button>

        <button 
          onClick={() => onTabChange('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center gap-1.5 group active:scale-95 transition-transform`}
        >
           <div className={`transition-all duration-300 ${activeTab === 'dashboard' ? 'text-gray-900 -translate-y-1' : 'text-gray-300'}`}>
            <Home className={`w-6 h-6 ${activeTab === 'dashboard' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
           </div>
           <span className={`text-[10px] font-bold transition-colors ${activeTab === 'dashboard' ? 'text-gray-900' : 'text-gray-300'}`}>홈</span>
        </button>

        <button 
           onClick={() => onTabChange('settings')}
           className={`flex-1 flex flex-col items-center justify-center gap-1.5 group active:scale-95 transition-transform`}
        >
           <div className={`transition-all duration-300 ${activeTab === 'settings' ? 'text-gray-900 -translate-y-1' : 'text-gray-300'}`}>
             <Settings className={`w-6 h-6 ${activeTab === 'settings' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
           </div>
           <span className={`text-[10px] font-bold transition-colors ${activeTab === 'settings' ? 'text-gray-900' : 'text-gray-300'}`}>설정</span>
        </button>

      </nav>
    </div>
  );
};

export default Layout;