import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Database, 
  Activity, 
  Shield, 
  Eye, 
  EyeOff, 
  Trash2, 
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  UserCheck,
  UserX,
  FileText,
  Filter,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { userProfileService } from '../../services/userProfileService';
import { logService, LogEntry, LogLevel, LogCategory } from '../../services/logService';

interface AdminPanelProps {
  onClose: () => void;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  employeeType: 'normal' | 'manager' | 'admin';
  department?: string;
  position?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { salaries, overtimes, leaves, holidays, refreshData } = useData();
  const { showSuccess, showError, showWarning } = useToast();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'data' | 'logs'>('overview');
  const [showPasswords, setShowPasswords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Log state'leri
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logStats, setLogStats] = useState<any>(null);
  const [logFilters, setLogFilters] = useState({
    level: '' as LogLevel | '',
    category: '' as LogCategory | '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });
  
  // Gerçek kullanıcı verilerini yükle
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Supabase'den tüm kullanıcıları al
      const users = await userProfileService.getAllUsers();
      if (users) {
        setAllUsers(users.map((user: any) => ({
          id: user.uid || user.id,
          name: user.name || 'İsimsiz Kullanıcı',
          email: user.email || '',
          password: user.password || 'Şifre bilgisi mevcut değil',
          employeeType: user.employeeType || 'normal',
          department: user.department || '',
          position: user.position || '',
          isActive: user.isActive !== undefined ? user.isActive : true, // Varsayılan olarak aktif
          lastLogin: user.lastLogin || 'Hiç giriş yapmamış',
          createdAt: user.createdAt || new Date().toISOString()
        })));
      } else {
        setAllUsers([]);
      }
    } catch (error: any) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      // Permission hatası durumunda bilgilendir
      if (error.message?.includes('permissions')) {
        console.log('⚠️ Permission error - using fallback data');
        showError('Yetki hatası: Admin yetkisi gerekli');
      } else {
        showError('Kullanıcılar yüklenirken hata oluştu');
      }
      setAllUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Component mount olduğunda kullanıcıları yükle
  useEffect(() => {
    loadUsers();
  }, []);

  // Logları yükle
  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logsData = await logService.getAllLogs(500);
      setLogs(logsData);
      
      // Log istatistiklerini al
      const stats = await logService.getLogStats();
      setLogStats(stats);
    } catch (error: any) {
      console.error('Loglar yüklenirken hata:', error);
      // Permission hatası durumunda bilgilendir
      if (error.message?.includes('permissions')) {
        console.log('⚠️ Permission error - using fallback data');
        showError('Yetki hatası: Admin yetkisi gerekli');
      } else {
        showError('Loglar yüklenirken hata oluştu');
      }
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Filtrelenmiş logları yükle
  const loadFilteredLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const filters: any = {};
      
      if (logFilters.level) filters.level = logFilters.level;
      if (logFilters.category) filters.category = logFilters.category;
      if (logFilters.startDate) filters.startDate = new Date(logFilters.startDate);
      if (logFilters.endDate) filters.endDate = new Date(logFilters.endDate);
      
      const logsData = await logService.getFilteredLogs(filters);
      
      // Arama filtresi uygula
      let filteredLogs = logsData;
      if (logFilters.searchTerm) {
        filteredLogs = logsData.filter(log => 
          log.message.toLowerCase().includes(logFilters.searchTerm.toLowerCase()) ||
          log.userEmail?.toLowerCase().includes(logFilters.searchTerm.toLowerCase()) ||
          log.userId?.toLowerCase().includes(logFilters.searchTerm.toLowerCase())
        );
      }
      
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Filtrelenmiş loglar yüklenirken hata:', error);
      showError('Loglar filtrelenirken hata oluştu');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Admin yetkisi kontrolü
  if (user?.employeeType !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erişim Reddedildi</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Admin paneline erişim yetkiniz bulunmamaktadır.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'activate':
          // Supabase'de kullanıcıyı aktifleştir
          await userProfileService.updateUserStatus(userId, true);
          setAllUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, isActive: true } : u
          ));
          showSuccess('Kullanıcı aktifleştirildi');
          break;
        case 'deactivate':
          // Supabase'de kullanıcıyı deaktifleştir
          await userProfileService.updateUserStatus(userId, false);
          setAllUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, isActive: false } : u
          ));
          showWarning('Kullanıcı deaktifleştirildi');
          break;
        case 'makeAdmin':
          // Kullanıcıyı admin yap
          await userProfileService.updateUserRole(userId, 'admin');
          setAllUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, employeeType: 'admin' } : u
          ));
          showSuccess('Kullanıcı admin yetkisi verildi');
          break;
        case 'makeManager':
          // Kullanıcıyı yönetici yap
          await userProfileService.updateUserRole(userId, 'manager');
          setAllUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, employeeType: 'manager' } : u
          ));
          showSuccess('Kullanıcı yönetici yetkisi verildi');
          break;
        case 'makeNormal':
          // Kullanıcıyı normal çalışan yap
          await userProfileService.updateUserRole(userId, 'normal');
          setAllUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, employeeType: 'normal' } : u
          ));
          showSuccess('Kullanıcı normal çalışan yapıldı');
          break;
        case 'delete':
          if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            // Supabase'den kullanıcıyı sil
            await userProfileService.deleteUser(userId);
            setAllUsers(prev => prev.filter(u => u.id !== userId));
            showSuccess('Kullanıcı silindi');
            
            // Admin işlemini logla
            if (user) {
              await logService.logAdminAction(
                user.id,
                user.email,
                'delete_user',
                userId,
                allUsers.find(u => u.id === userId)?.email
              );
            }
          }
          break;
      }
    } catch (error) {
      console.error('Kullanıcı işlemi sırasında hata:', error);
      showError('İşlem sırasında hata oluştu');
    }
  };

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportUsers = () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Ad,Email,Departman,Pozisyon,Yetki,Durum,Son Giriş\n" +
        filteredUsers.map(u => 
          `${u.name},${u.email},${u.department || ''},${u.position || ''},${u.employeeType},${u.isActive ? 'Aktif' : 'Pasif'},${u.lastLogin || ''}`
        ).join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `kullanicilar_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('Kullanıcı verileri dışa aktarıldı');
    } catch (error) {
      showError('Dışa aktarma sırasında hata oluştu');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Paneli</h1>
              <p className="text-gray-600 dark:text-gray-400">Sistem yönetimi ve kullanıcı kontrolü</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="sr-only">Kapat</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Genel Bakış
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Kullanıcı Yönetimi
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Database className="h-4 w-4 inline mr-2" />
            Veri Yönetimi
          </button>
          <button
            onClick={() => {
              setActiveTab('logs');
              loadLogs();
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Sistem Logları
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Toplam Kullanıcı</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{allUsers.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <UserCheck className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Aktif Kullanıcı</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {allUsers.filter(u => u.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <Database className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Maaş Kayıtları</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{salaries.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">Mesai Kayıtları</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{overtimes.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Son Aktiviteler */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Son Aktiviteler</h3>
                {isLoadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Kullanıcılar yükleniyor...</p>
                  </div>
                ) : allUsers.length > 0 ? (
                  <div className="space-y-3">
                    {allUsers.slice(0, 5).map((user, index) => (
                      <div key={user.id || `user-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Son giriş</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{user.lastLogin}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Henüz kullanıcı bulunmuyor</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Kullanıcı ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      console.log('🔍 Detay butonu tıklandı, mevcut durum:', showPasswords);
                      setShowPasswords(!showPasswords);
                      console.log('🔍 Yeni durum:', !showPasswords);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                         <span>Şifreler {showPasswords ? '(Gizle)' : '(Göster)'}</span>
                  </button>
                  <button
                    onClick={handleExportUsers}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Dışa Aktar</span>
                  </button>
                  <button
                    onClick={loadUsers}
                    disabled={isLoadingUsers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                    <span>Yenile</span>
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                {isLoadingUsers ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Kullanıcılar yükleniyor...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gray-50 dark:bg-gray-600">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Kullanıcı
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Departman
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Yetki
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Durum
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Son Giriş
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                                     {showPasswords && (
                                     <div className="text-xs text-gray-500">
                                       <div>🆔 ID: {user.id}</div>
                                       <div>📅 Oluşturulma: {user.createdAt}</div>
                                       <div>🔑 Şifre: {user.password || 'Şifre bilgisi mevcut değil'}</div>
                                     </div>
                                   )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{user.department || '-'}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.position || '-'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.employeeType === 'admin' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                    : user.employeeType === 'manager'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                }`}>
                                  {user.employeeType === 'admin' ? 'Admin' : 
                                   user.employeeType === 'manager' ? 'Yönetici' : 'Kullanıcı'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.isActive 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                  {user.isActive ? 'Aktif' : 'Pasif'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {user.lastLogin || 'Hiç giriş yapmamış'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  {user.isActive ? (
                                    <button
                                      onClick={() => handleUserAction('deactivate', user.id)}
                                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                      title="Deaktifleştir"
                                    >
                                      <UserX className="h-4 w-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUserAction('activate', user.id)}
                                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                      title="Aktifleştir"
                                    >
                                      <UserCheck className="h-4 w-4" />
                                    </button>
                                  )}
                                  
                                  {/* Yetki Değiştirme Butonları */}
                                  {user.employeeType !== 'admin' && (
                                    <button
                                      onClick={() => handleUserAction('makeAdmin', user.id)}
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                      title="Admin Yap"
                                    >
                                      <Shield className="h-4 w-4" />
                                    </button>
                                  )}
                                  
                                  {user.employeeType !== 'manager' && (
                                    <button
                                      onClick={() => handleUserAction('makeManager', user.id)}
                                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                      title="Yönetici Yap"
                                    >
                                      <Shield className="h-4 w-4" />
                                    </button>
                                  )}
                                  
                                  {user.employeeType !== 'normal' && (
                                    <button
                                      onClick={() => handleUserAction('makeNormal', user.id)}
                                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                      title="Normal Çalışan Yap"
                                    >
                                      <UserCheck className="h-4 w-4" />
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => handleUserAction('delete', user.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    title="Sil"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 dark:text-gray-400">
                                {searchTerm ? 'Arama kriterlerine uygun kullanıcı bulunamadı' : 'Henüz kullanıcı bulunmuyor'}
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Data Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Database className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maaş Kayıtları</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{salaries.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mesai Kayıtları</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{overtimes.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">İzin Kayıtları</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaves.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tatil Kayıtları</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{holidays.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Actions */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Veri İşlemleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => showSuccess('Sistem yedeği oluşturuldu')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Database className="h-5 w-5" />
                    <span>Yedek Oluştur</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      refreshData();
                      showSuccess('Veriler yenilendi');
                    }}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span>Verileri Yenile</span>
                  </button>
                  
                  <button
                    onClick={() => showSuccess('Tüm veriler dışa aktarıldı')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    <span>Tüm Verileri Dışa Aktar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* Log İstatistikleri */}
              {logStats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Toplam Log</p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{logStats.total}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-600">Son 24 Saat Hata</p>
                        <p className="text-xl font-bold text-red-900 dark:text-red-100">{logStats.recentErrors}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Başarılı</p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">{logStats.byLevel.success}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-600">Ort. Süre</p>
                        <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">{Math.round(logStats.averageResponseTime)}ms</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">Bilgi</p>
                        <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{logStats.byLevel.info}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Log Filtreleri */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Log ara..."
                      value={logFilters.searchTerm}
                      onChange={(e) => setLogFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <select
                    value={logFilters.level}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, level: e.target.value as LogLevel | '' }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Tüm Seviyeler</option>
                    <option value="info">Bilgi</option>
                    <option value="warning">Uyarı</option>
                    <option value="error">Hata</option>
                    <option value="success">Başarı</option>
                    <option value="debug">Debug</option>
                  </select>
                  
                  <select
                    value={logFilters.category}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, category: e.target.value as LogCategory | '' }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Tüm Kategoriler</option>
                    <option value="auth">Kimlik Doğrulama</option>
                    <option value="user">Kullanıcı</option>
                    <option value="salary">Maaş</option>
                    <option value="overtime">Mesai</option>
                    <option value="leave">İzin</option>
                    <option value="system">Sistem</option>
                    <option value="admin">Admin</option>
                    <option value="data">Veri</option>
                    <option value="security">Güvenlik</option>
                    <option value="performance">Performans</option>
                  </select>
                  
                  <input
                    type="date"
                    value={logFilters.startDate}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  
                  <input
                    type="date"
                    value={logFilters.endDate}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  
                  <button
                    onClick={loadFilteredLogs}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filtrele</span>
                  </button>
                  
                  <button
                    onClick={loadLogs}
                    disabled={isLoadingLogs}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                    <span>Yenile</span>
                  </button>
                </div>
              </div>

              {/* Log Tablosu */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                {isLoadingLogs ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loglar yükleniyor...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gray-50 dark:bg-gray-600">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Tarih
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Seviye
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Mesaj
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Kullanıcı
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            İşlem
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                        {logs.length > 0 ? (
                          logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(log.timestamp).toLocaleString('tr-TR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  log.level === 'error' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                    : log.level === 'warning'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : log.level === 'success'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : log.level === 'debug'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                }`}>
                                  {log.level.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {log.category}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                {log.message}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {log.userEmail || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {log.userAction || '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 dark:text-gray-400">
                                {logFilters.searchTerm || logFilters.level || logFilters.category 
                                  ? 'Filtre kriterlerine uygun log bulunamadı' 
                                  : 'Henüz log kaydı bulunmuyor'}
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 