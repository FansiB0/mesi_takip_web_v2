// Network utilities for handling Firebase connection issues

// Network durumu kontrolü
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Network event listener'ları
export const setupNetworkListeners = (
  onOnline: () => void,
  onOffline: () => void
) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Firebase bağlantı testi
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Basit bir network testi
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    console.warn('⚠️ Network connection test failed:', error);
    return false;
  }
};

// Firebase API endpoint testi
export const testFirebaseAPI = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://securetoken.googleapis.com/v1/token', {
      method: 'OPTIONS',
      mode: 'cors'
    });
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Firebase API test failed:', error);
    return false;
  }
};

// Retry mekanizması için exponential backoff
export const exponentialBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// Offline mode detection
export const isOfflineMode = (): boolean => {
  return !isOnline() || localStorage.getItem('offline_mode') === 'true';
};

// Offline mode toggle
export const toggleOfflineMode = (enabled: boolean): void => {
  if (enabled) {
    localStorage.setItem('offline_mode', 'true');
    console.log('🔌 Offline mode enabled');
  } else {
    localStorage.removeItem('offline_mode');
    console.log('🌐 Offline mode disabled');
  }
};

// Network quality check
export const checkNetworkQuality = async (): Promise<'good' | 'poor' | 'offline'> => {
  if (!isOnline()) {
    return 'offline';
  }

  try {
    const startTime = performance.now();
    await fetch('https://www.google.com', { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    if (responseTime < 1000) {
      return 'good';
    } else {
      return 'poor';
    }
  } catch (error) {
    return 'offline';
  }
};

// Connection status monitoring
export class ConnectionMonitor {
  private listeners: Array<(status: 'online' | 'offline' | 'poor') => void> = [];
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    this.intervalId = setInterval(async () => {
      const quality = await checkNetworkQuality();
      const status = quality === 'offline' ? 'offline' : 
                    quality === 'poor' ? 'poor' : 'online';
      
      this.listeners.forEach(listener => listener(status));
    }, 5000); // Her 5 saniyede bir kontrol et
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onStatusChange(listener: (status: 'online' | 'offline' | 'poor') => void) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// Global connection monitor instance
export const connectionMonitor = new ConnectionMonitor(); 