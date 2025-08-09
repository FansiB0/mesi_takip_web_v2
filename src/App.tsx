import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './contexts/ToastContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import SalaryManagement from './components/Salary/SalaryManagement';
import OvertimeTracking from './components/Overtime/OvertimeTracking';
import CalendarView from './components/Calendar/CalendarView';
import LeaveManagement from './components/Leaves/LeaveManagement';
import ReportsAnalytics from './components/Reports/ReportsAnalytics';
import Settings from './components/Settings/Settings';
import CompensationCalculators from './components/Calculators/CompensationCalculators';
import AdminPanel from './components/Admin/AdminPanel';
import { useTheme } from './hooks/useTheme';
// Supabase bağlantı testi (sadece development ortamında)
if (import.meta.env.DEV) {
  console.log('✅ Supabase configuration loaded');
}

const AuthWrapper: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">₺</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Maaş ve Çalışma Takibi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Maaşınızı, fazla mesainizi ve izinlerinizi kolayca yönetin
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {showLogin ? (
            <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Debug için console log (sadece development'ta)
  if (import.meta.env.DEV) {
    console.log('🔄 MainAppContent render:', { user: user?.id, isLoading, activeTab });
  }

  // Hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') {
        setShowAdminPanel(true);
        setActiveTab('dashboard'); // Admin panel açıldığında dashboard tab'ında kal
      } else if (hash && ['dashboard', 'salary', 'overtime', 'calendar', 'leaves', 'reports', 'settings', 'calculators'].includes(hash)) {
        setActiveTab(hash);
        setShowAdminPanel(false);
      }
    };

    // İlk yükleme
    handleHashChange();

    // Hash değişikliklerini dinle
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // ActiveTab değiştiğinde hash'i güncelle (sadece programatik değişiklikler için)
  useEffect(() => {
    const currentHash = window.location.hash.replace('#', '');
    if (activeTab !== currentHash) {
      if (activeTab !== 'dashboard') {
        window.location.hash = `#${activeTab}`;
      } else {
        window.location.hash = '';
      }
    }
  }, [activeTab]);

  // Geçici olarak loading kontrolünü devre dışı bırak
  if (false && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthWrapper />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'salary':
        return <SalaryManagement />;
      case 'overtime':
        return <OvertimeTracking />;
      case 'calendar':
        return <CalendarView />;
      case 'leaves':
        return <LeaveManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <Settings />;
      case 'calculators':
        return <CompensationCalculators />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex pt-16">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            if (tab === 'admin') {
              setShowAdminPanel(true);
            } else {
              setActiveTab(tab);
              setShowAdminPanel(false);
            }
          }} 
        />
        <main 
          className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'md:ml-16' : 'md:ml-64'
          }`}
        >
          {renderActiveComponent()}
        </main>
      </div>

      {/* Admin Panel Modal */}
      {showAdminPanel && user?.role === 'admin' && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
};

const MainApp: React.FC = () => {
  useTheme(); // Tema hook'unu uygula
  
  return (
    <SidebarProvider>
      <MainAppContent />
    </SidebarProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <SettingsProvider>
              <NotificationProvider>
                <MainApp />
              </NotificationProvider>
            </SettingsProvider>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;