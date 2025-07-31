import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './contexts/ToastContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { SettingsProvider } from './contexts/SettingsContext';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main 
          className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'md:ml-16' : 'md:ml-64'
          }`}
        >
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  return (
    <SettingsProvider>
      <SidebarProvider>
        <MainAppContent />
      </SidebarProvider>
    </SettingsProvider>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;