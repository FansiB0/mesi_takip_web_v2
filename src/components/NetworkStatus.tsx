import React from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface NetworkStatusProps {
  className?: string;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ className = '' }) => {
  const { isOffline, networkQuality, toggleOfflineMode } = useData();

  const getStatusInfo = () => {
    if (isOffline) {
      return {
        icon: WifiOff,
        text: 'Çevrimdışı Mod',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    switch (networkQuality) {
      case 'good':
        return {
          icon: Wifi,
          text: 'Bağlantı İyi',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'poor':
        return {
          icon: AlertTriangle,
          text: 'Bağlantı Zayıf',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'offline':
        return {
          icon: WifiOff,
          text: 'Bağlantı Yok',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: Wifi,
          text: 'Bağlantı Kontrol Ediliyor',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} ${className}`}>
      <Icon className={`h-4 w-4 ${statusInfo.color}`} />
      <span className={`text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
      
      {isOffline && (
        <button
          onClick={() => toggleOfflineMode(false)}
          className="ml-2 p-1 rounded hover:bg-red-100 transition-colors"
          title="Çevrimdışı modu kapat"
        >
          <RefreshCw className="h-3 w-3 text-red-600" />
        </button>
      )}
      
      {networkQuality === 'poor' && (
        <button
          onClick={() => toggleOfflineMode(true)}
          className="ml-2 p-1 rounded hover:bg-yellow-100 transition-colors"
          title="Çevrimdışı moda geç"
        >
          <WifiOff className="h-3 w-3 text-yellow-600" />
        </button>
      )}
    </div>
  );
};

export default NetworkStatus; 