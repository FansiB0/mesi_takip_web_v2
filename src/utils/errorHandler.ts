import { ApiResponse, LoadingState } from '../types';

// Hata türleri
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

// Hata mesajları
export const ERROR_MESSAGES = {
  [ErrorType.NETWORK]: {
    title: 'Bağlantı Hatası',
    message: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
    action: 'Tekrar Dene'
  },
  [ErrorType.VALIDATION]: {
    title: 'Geçersiz Veri',
    message: 'Lütfen girdiğiniz bilgileri kontrol edin.',
    action: 'Düzelt'
  },
  [ErrorType.AUTHENTICATION]: {
    title: 'Giriş Hatası',
    message: 'Email veya şifreniz hatalı. Lütfen tekrar deneyin.',
    action: 'Tekrar Dene'
  },
  [ErrorType.AUTHORIZATION]: {
    title: 'Yetki Hatası',
    message: 'Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.',
    action: 'Geri Dön'
  },
  [ErrorType.NOT_FOUND]: {
    title: 'Bulunamadı',
    message: 'Aradığınız veri bulunamadı.',
    action: 'Geri Dön'
  },
  [ErrorType.SERVER_ERROR]: {
    title: 'Sunucu Hatası',
    message: 'Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
    action: 'Tekrar Dene'
  },
  [ErrorType.UNKNOWN]: {
    title: 'Bilinmeyen Hata',
    message: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
    action: 'Tekrar Dene'
  }
};

// Supabase hata kodlarını ErrorType'a çevirme
export const mapSupabaseError = (errorCode: string): ErrorType => {
  const errorMap: Record<string, ErrorType> = {
    'PGRST116': ErrorType.NOT_FOUND,
    'PGRST301': ErrorType.AUTHENTICATION,
    '23505': ErrorType.VALIDATION,
    '23503': ErrorType.VALIDATION,
    '42P01': ErrorType.NOT_FOUND,
    '42501': ErrorType.AUTHORIZATION,
    'network-request-failed': ErrorType.NETWORK,
    'invalid-email': ErrorType.VALIDATION,
    'weak-password': ErrorType.VALIDATION,
    'user-not-found': ErrorType.AUTHENTICATION,
    'wrong-password': ErrorType.AUTHENTICATION,
    'email-already-in-use': ErrorType.VALIDATION,
    'too-many-requests': ErrorType.AUTHENTICATION,
    'user-disabled': ErrorType.AUTHORIZATION,
    'permission-denied': ErrorType.AUTHORIZATION,
    'not-found': ErrorType.NOT_FOUND,
    'unavailable': ErrorType.NETWORK,
    'deadline-exceeded': ErrorType.NETWORK,
    'resource-exhausted': ErrorType.SERVER_ERROR,
    'failed-precondition': ErrorType.VALIDATION,
    'aborted': ErrorType.SERVER_ERROR,
    'out-of-range': ErrorType.VALIDATION,
    'unimplemented': ErrorType.SERVER_ERROR,
    'internal': ErrorType.SERVER_ERROR,
    'data-loss': ErrorType.SERVER_ERROR
  };

  return errorMap[errorCode] || ErrorType.UNKNOWN;
};

// Hata sınıflandırma
export const classifyError = (error: any): ErrorType => {
  if (error?.code) {
    return mapSupabaseError(error.code);
  }

  if (error?.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('connection')) {
      return ErrorType.NETWORK;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    
    if (message.includes('auth') || message.includes('login')) {
      return ErrorType.AUTHENTICATION;
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return ErrorType.AUTHORIZATION;
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND;
    }
  }

  return ErrorType.UNKNOWN;
};

// Retry mekanizması
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Sadece network hatalarında retry yap
      const errorType = classifyError(error);
      if (errorType !== ErrorType.NETWORK && errorType !== ErrorType.SERVER_ERROR) {
        throw error;
      }

      if (attempt < maxRetries) {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
};

// API response wrapper
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  error?: string,
  errorType?: ErrorType
): ApiResponse<T> => {
  return {
    success,
    data,
    error,
    errorType
  };
};

// Loading state yönetimi
export const createLoadingState = (isLoading: boolean, error?: string): LoadingState => {
  return {
    isLoading,
    error,
    retryCount: 0
  };
};

// Hata loglama
export const logError = (error: any, context?: string) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    },
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.error('🚨 Application Error:', errorInfo);
  
  // Production'da hata tracking servisi kullanılabilir
  if (import.meta.env.PROD) {
    // Sentry, LogRocket vb. servisler burada kullanılabilir
    console.log('Error would be sent to tracking service in production');
  }
};

// Offline durumu kontrolü
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Offline/Online event listener'ları
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

// Debounce fonksiyonu
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle fonksiyonu
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}; 