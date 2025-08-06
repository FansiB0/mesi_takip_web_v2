import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  Timestamp,
  addDoc,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { retryOperation, logError } from '../utils/errorHandler';

// Log seviyeleri
export type LogLevel = 'info' | 'warning' | 'error' | 'success' | 'debug';

// Log kategorileri
export type LogCategory = 
  | 'auth' 
  | 'user' 
  | 'salary' 
  | 'overtime' 
  | 'leave' 
  | 'system' 
  | 'admin' 
  | 'data' 
  | 'security' 
  | 'performance';

// Log veri tipi
export interface LogEntry {
  id?: string;
  timestamp: Timestamp;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  userId?: string;
  userEmail?: string;
  userAction?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  errorCode?: string;
  errorStack?: string;
  dataBefore?: any;
  dataAfter?: any;
  duration?: number; // milisaniye
  resource?: string; // hangi kaynak/endpoint
  method?: string; // HTTP method
  statusCode?: number;
  requestSize?: number;
  responseSize?: number;
}

// Log servisi
// undefined değerleri temizleyen yardımcı fonksiyon
const removeUndefinedValues = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item)).filter(item => item !== null);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedValues(value);
      }
    }
    return cleaned;
  }
  
  return obj;
};

export const logService = {
  // Yeni log kaydı oluştur
  async createLog(logData: Omit<LogEntry, 'timestamp'>): Promise<boolean> {
    try {
      // undefined değerleri temizle
      const cleanLogData = removeUndefinedValues(logData);
      
      const logEntry: LogEntry = {
        ...cleanLogData,
        timestamp: Timestamp.now()
      };

      // Firebase'e kaydet
      await retryOperation(async () => {
        await addDoc(collection(db, 'systemLogs'), logEntry);
      });

      // Local storage'a da kaydet (fallback için)
      this.saveToLocalStorage(logEntry);

      console.log(`📝 Log created: [${logEntry.level.toUpperCase()}] ${logEntry.message}`);
      return true;
    } catch (error: any) {
      console.error('❌ Error creating log:', error);
      
      // Sadece local storage'a kaydet
      try {
        const cleanLogData = removeUndefinedValues(logData);
        const logEntry: LogEntry = {
          ...cleanLogData,
          timestamp: Timestamp.now()
        };
        this.saveToLocalStorage(logEntry);
        return true;
      } catch (localError) {
        console.error('❌ Failed to save log to local storage:', localError);
        return false;
      }
    }
  },

  // Kullanıcı giriş logu
  async logUserLogin(userId: string, userEmail: string, success: boolean, error?: string): Promise<void> {
    await this.createLog({
      level: success ? 'success' : 'error',
      category: 'auth',
      message: success ? 'Kullanıcı giriş yaptı' : 'Giriş başarısız',
      userId,
      userEmail,
      userAction: 'login',
      details: removeUndefinedValues({
        success,
        error,
        timestamp: new Date().toISOString()
      })
    });
  },

  // Kullanıcı kayıt logu
  async logUserRegistration(userId: string, userEmail: string, success: boolean, error?: string): Promise<void> {
    await this.createLog({
      level: success ? 'success' : 'error',
      category: 'auth',
      message: success ? 'Yeni kullanıcı kaydı' : 'Kayıt başarısız',
      userId,
      userEmail,
      userAction: 'register',
      details: removeUndefinedValues({
        success,
        error,
        timestamp: new Date().toISOString()
      })
    });
  },

  // Veri işlem logu
  async logDataOperation(
    category: LogCategory,
    operation: 'create' | 'update' | 'delete' | 'read',
    resource: string,
    userId: string,
    userEmail: string,
    success: boolean,
    dataBefore?: any,
    dataAfter?: any,
    error?: string
  ): Promise<void> {
    await this.createLog({
      level: success ? 'info' : 'error',
      category,
      message: `${operation.toUpperCase()} işlemi ${success ? 'başarılı' : 'başarısız'}`,
      userId,
      userEmail,
      userAction: operation,
      resource,
      details: removeUndefinedValues({
        operation,
        resource,
        success,
        error,
        dataBefore,
        dataAfter,
        timestamp: new Date().toISOString()
      })
    });
  },

  // Admin işlem logu
  async logAdminAction(
    adminId: string,
    adminEmail: string,
    action: string,
    targetUserId?: string,
    targetUserEmail?: string,
    details?: any
  ): Promise<void> {
    await this.createLog({
      level: 'info',
      category: 'admin',
      message: `Admin işlemi: ${action}`,
      userId: adminId,
      userEmail: adminEmail,
      userAction: action,
      details: removeUndefinedValues({
        action,
        targetUserId,
        targetUserEmail,
        ...details,
        timestamp: new Date().toISOString()
      })
    });
  },

  // Hata logu
  async logError(
    error: Error,
    category: LogCategory,
    userId?: string,
    userEmail?: string,
    context?: any
  ): Promise<void> {
    await this.createLog({
      level: 'error',
      category,
      message: error.message,
      userId,
      userEmail,
      errorCode: error.name,
      errorStack: error.stack,
      details: removeUndefinedValues({
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      })
    });
  },

  // Performans logu
  async logPerformance(
    operation: string,
    duration: number,
    resource: string,
    userId?: string,
    userEmail?: string
  ): Promise<void> {
    await this.createLog({
      level: duration > 5000 ? 'warning' : 'info',
      category: 'performance',
      message: `Performans: ${operation} - ${duration}ms`,
      userId,
      userEmail,
      duration,
      resource,
      details: removeUndefinedValues({
        operation,
        duration,
        resource,
        timestamp: new Date().toISOString()
      })
    });
  },

  // Güvenlik logu
  async logSecurityEvent(
    event: string,
    userId?: string,
    userEmail?: string,
    details?: any
  ): Promise<void> {
    await this.createLog({
      level: 'warning',
      category: 'security',
      message: `Güvenlik olayı: ${event}`,
      userId,
      userEmail,
      details: removeUndefinedValues({
        event,
        ...details,
        timestamp: new Date().toISOString()
      })
    });
  },

  // Tüm logları getir (Admin panel için)
  async getAllLogs(limitCount: number = 1000): Promise<LogEntry[]> {
    try {
      const logsRef = collection(db, 'systemLogs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      
      const querySnapshot = await retryOperation(async () => {
        return await getDocs(q);
      });
      
      const logs: LogEntry[] = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as LogEntry);
      });
      
      return logs;
    } catch (error: any) {
      console.error('❌ Error getting logs:', error);
      
      // Local storage'dan getir
      return this.getLogsFromLocalStorage(limitCount);
    }
  },

  // Filtrelenmiş logları getir
  async getFilteredLogs(filters: {
    level?: LogLevel;
    category?: LogCategory;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<LogEntry[]> {
    try {
      let q = query(collection(db, 'systemLogs'), orderBy('timestamp', 'desc'));
      
      if (filters.level) {
        q = query(q, where('level', '==', filters.level));
      }
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }
      
      const querySnapshot = await retryOperation(async () => {
        return await getDocs(q);
      });
      
      const logs: LogEntry[] = [];
      querySnapshot.forEach((doc) => {
        const log = { id: doc.id, ...doc.data() } as LogEntry;
        
        // Tarih filtreleme
        if (filters.startDate && log.timestamp.toDate() < filters.startDate) {
          return;
        }
        
        if (filters.endDate && log.timestamp.toDate() > filters.endDate) {
          return;
        }
        
        logs.push(log);
      });
      
      return logs;
    } catch (error: any) {
      console.error('❌ Error getting filtered logs:', error);
      return [];
    }
  },

  // Local storage'a kaydet
  saveToLocalStorage(logEntry: LogEntry): void {
    try {
      const logs = this.getLogsFromLocalStorage();
      logs.unshift(logEntry);
      
      // Sadece son 1000 logu tut
      if (logs.length > 1000) {
        logs.splice(1000);
      }
      
      localStorage.setItem('systemLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('❌ Failed to save log to local storage:', error);
    }
  },

  // Local storage'dan getir
  getLogsFromLocalStorage(limit: number = 1000): LogEntry[] {
    try {
      const logsData = localStorage.getItem('systemLogs');
      if (logsData) {
        const logs = JSON.parse(logsData);
        return logs.slice(0, limit).map((log: any) => ({
          ...log,
          timestamp: Timestamp.fromDate(new Date(log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp))
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to get logs from local storage:', error);
      return [];
    }
  },

  // Logları temizle
  async clearLogs(olderThanDays: number = 30): Promise<boolean> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const logs = await this.getAllLogs();
      const logsToDelete = logs.filter(log => log.timestamp.toDate() < cutoffDate);
      
      // Firebase'den eski logları sil (batch delete)
      for (const log of logsToDelete) {
        if (log.id) {
          await retryOperation(async () => {
            await setDoc(doc(db, 'systemLogs', log.id!), { deleted: true });
          });
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Error clearing logs:', error);
      return false;
    }
  },

  // Log istatistikleri
  async getLogStats(): Promise<{
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    recentErrors: number;
    averageResponseTime: number;
  }> {
    try {
      const logs = await this.getAllLogs();
      
      const stats = {
        total: logs.length,
        byLevel: {
          info: 0,
          warning: 0,
          error: 0,
          success: 0,
          debug: 0
        },
        byCategory: {
          auth: 0,
          user: 0,
          salary: 0,
          overtime: 0,
          leave: 0,
          system: 0,
          admin: 0,
          data: 0,
          security: 0,
          performance: 0
        },
        recentErrors: 0,
        averageResponseTime: 0
      };
      
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      
      let totalDuration = 0;
      let durationCount = 0;
      
      logs.forEach(log => {
        // Seviye sayımı
        stats.byLevel[log.level]++;
        
        // Kategori sayımı
        stats.byCategory[log.category]++;
        
        // Son 24 saatteki hatalar
        if (log.level === 'error' && log.timestamp.toDate() > last24Hours) {
          stats.recentErrors++;
        }
        
        // Ortalama süre hesaplama
        if (log.duration) {
          totalDuration += log.duration;
          durationCount++;
        }
      });
      
      stats.averageResponseTime = durationCount > 0 ? totalDuration / durationCount : 0;
      
      return stats;
    } catch (error: any) {
      console.error('❌ Error getting log stats:', error);
      return {
        total: 0,
        byLevel: { info: 0, warning: 0, error: 0, success: 0, debug: 0 },
        byCategory: { auth: 0, user: 0, salary: 0, overtime: 0, leave: 0, system: 0, admin: 0, data: 0, security: 0, performance: 0 },
        recentErrors: 0,
        averageResponseTime: 0
      };
    }
  }
}; 