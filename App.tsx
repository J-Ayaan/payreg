import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SubscriptionList from './components/SubscriptionList';
import AddSubscriptionModal from './components/AddSubscriptionModal';
import SubscriptionDetail from './components/SubscriptionDetail';
import Settings from './components/Settings';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Subscription, ExchangeRate } from './types';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    service_name: 'Netflix',
    category: 'Media',
    plan_name: 'Premium',
    price: 17000,
    currency: 'KRW',
    billing_cycle: 'monthly',
    billing_date: new Date().getDate(), 
    next_billing_date: new Date().toISOString(),
    status: 'active',
    payment_method: '현대카드',
    color: '#E50914',
    logo_url: 'https://logo.clearbit.com/netflix.com'
  },
  {
    id: '2',
    service_name: 'YouTube Premium',
    category: 'Media',
    plan_name: 'Individual',
    price: 14900,
    currency: 'KRW',
    billing_cycle: 'monthly',
    billing_date: new Date().getDate() + 1,
    next_billing_date: new Date(Date.now() + 86400000).toISOString(),
    status: 'active',
    payment_method: '카카오페이',
    color: '#FF0000',
    logo_url: 'https://logo.clearbit.com/youtube.com'
  },
  {
    id: '3',
    service_name: 'Claude',
    category: 'AI',
    plan_name: 'Pro',
    price: 20,
    currency: 'USD',
    billing_cycle: 'monthly',
    billing_date: new Date().getDate() + 5,
    next_billing_date: new Date(Date.now() + 432000000).toISOString(),
    status: 'active',
    payment_method: '토스',
    color: '#D97757',
    logo_url: 'https://logo.clearbit.com/anthropic.com'
  }
];

const MOCK_EXCHANGE_RATE: ExchangeRate = {
  base: 'USD',
  target: 'KRW',
  rate: 1395.50,
  updated_at: new Date().toISOString()
};

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [exchangeRate] = useState<ExchangeRate>(MOCK_EXCHANGE_RATE);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('subtracker_subs');
    if (saved) {
      try {
        setSubscriptions(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('subtracker_subs', JSON.stringify(subscriptions));
  }, [subscriptions]);

  const handleSaveSubscription = (data: Omit<Subscription, 'id'>) => {
    if (editingSub) {
      // Update existing
      setSubscriptions(prev => prev.map(sub => 
        sub.id === editingSub.id 
          ? { ...data, id: editingSub.id, color: editingSub.color, logo_url: data.logo_url || editingSub.logo_url } 
          : sub
      ));
      // Update selected sub view if currently viewing it
      if (selectedSub && selectedSub.id === editingSub.id) {
         setSelectedSub({ ...data, id: editingSub.id, color: editingSub.color, logo_url: data.logo_url || editingSub.logo_url });
      }
      setEditingSub(null);
    } else {
      // Add new
      const sub: Subscription = { 
        ...data, 
        id: uuidv4(),
        // Fallback color if not provided
        color: data.color || '#' + Math.floor(Math.random()*16777215).toString(16) 
      };
      setSubscriptions(prev => [...prev, sub]);
    }
  };

  const handleDeleteSubscription = (id: string) => {
    if (window.confirm("정말 이 구독을 삭제하시겠습니까?")) {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      setSelectedSub(null); 
    }
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSub(sub);
    setIsAddModalOpen(true);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#F2F4F6]"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div></div>;
  if (!user) return <Login />;

  // Render logic
  const renderMainContent = () => {
    if (selectedSub) {
      return (
        <SubscriptionDetail 
          subscription={selectedSub} 
          onBack={() => setSelectedSub(null)}
          onDelete={handleDeleteSubscription}
          onEdit={openEditModal}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            <Dashboard 
              subscriptions={subscriptions} 
              exchangeRate={exchangeRate}
              onAddClick={() => {
                setEditingSub(null);
                setIsAddModalOpen(true);
              }}
              onSelectSubscription={setSelectedSub}
            />
          </Layout>
        );
      case 'subscriptions':
        return (
           <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            <SubscriptionList 
              subscriptions={subscriptions} 
              exchangeRate={exchangeRate}
              onDelete={handleDeleteSubscription}
              onOpenAddModal={() => {
                setEditingSub(null);
                setIsAddModalOpen(true);
              }}
              onSelectSubscription={setSelectedSub}
            />
          </Layout>
        );
      case 'settings':
         return (
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            <Settings />
          </Layout>
         );
      default:
        return null;
    }
  };

  return (
    <>
      {renderMainContent()}
      
      {/* Modal is now rendered at the root level, independent of layout/detail view */}
      <AddSubscriptionModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSub(null);
        }} 
        onAdd={handleSaveSubscription}
        initialData={editingSub}
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;