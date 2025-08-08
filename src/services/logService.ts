import { supabase } from '../config/supabase';

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
  timestamp: string;
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
  created_at?: string;
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
  async createLog(logData: Omit<LogEntry, 'id' | 'timestamp' | 'created_at'>): Promise<boolean> {
    try {
      // undefined değerleri temizle
      const cleanLogData = removeUndefinedValues(logData);
      
      const logEntry: Omit<LogEntry, 'id'> = {
        ...cleanLogData,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      // Supabase'e kaydet (system_logs tablosu henüz oluşturulmadı)
      // const { error } = await supabase
      //   .from('system_logs')
      //   .insert(logEntry);

      // if (error) throw error;

      // Local storage'a da kaydet (fallback için)
      this.saveToLocalStorage(logEntry as LogEntry);

      return true;
    } catch (error: any) {
      console.error('❌ Error creating log:', error);
      
      // Supabase başarısız olursa local storage'a kaydet
      try {
        const fallbackLogEntry: LogEntry = {
          ...logData,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        this.saveToLocalStorage(fallbackLogEntry);
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
      message: success ? 'Kullanıcı başarıyla giriş yaptı' : 'Kullanıcı girişi başarısız',
      userId,
      userEmail,
      userAction: 'login',
      details: error ? { error } : undefined
    });
  },

  // Kullanıcı kayıt logu
  async logUserRegistration(userId: string, userEmail: string, success: boolean, error?: string): Promise<void> {
    await this.createLog({
      level: success ? 'success' : 'error',
      category: 'auth',
      message: success ? 'Kullanıcı başarıyla kayıt oldu' : 'Kullanıcı kaydı başarısız',
      userId,
      userEmail,
      userAction: 'register',
      details: error ? { error } : undefined
    });
  },

  // Veri işlemi logu
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
      message: `${operation} işlemi ${success ? 'başarılı' : 'başarısız'}`,
      userId,
      userEmail,
      userAction: operation,
      resource,
      dataBefore,
      dataAfter,
      details: error ? { error } : undefined
    });
  },

  // Admin işlemi logu
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
      details: {
        targetUserId,
        targetUserEmail,
        ...details
      }
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
      details: context
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
      level: 'debug',
      category: 'performance',
      message: `Performans: ${operation}`,
      userId,
      userEmail,
      duration,
      resource
    });
  },

  // Güvenlik olayı logu
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
      details
    });
  },

  // Tüm logları getir
  async getAllLogs(limitCount: number = 1000): Promise<LogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limitCount);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Error getting logs:', error);
      
      // Supabase başarısız olursa local storage'dan getir
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
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.level) {
        query = query.eq('level', filters.level);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.userId) {
        query = query.eq('userId', filters.userId);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
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
      
      // Maksimum 1000 log tut
      if (logs.length > 1000) {
        logs.splice(1000);
      }
      
      localStorage.setItem('system_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('❌ Error saving to local storage:', error);
    }
  },

  // Local storage'dan getir
  getLogsFromLocalStorage(limit: number = 1000): LogEntry[] {
    try {
      const logsData = localStorage.getItem('system_logs');
      if (!logsData) return [];
      
      const logs: LogEntry[] = JSON.parse(logsData);
      return logs.slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting logs from local storage:', error);
      return [];
    }
  },

  // Eski logları temizle
  async clearLogs(olderThanDays: number = 30): Promise<boolean> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { error } = await supabase
        .from('system_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
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
      const logs = await this.getAllLogs(10000);
      
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
        // Level istatistikleri
        if (log.level in stats.byLevel) {
          stats.byLevel[log.level as LogLevel]++;
        }

        // Category istatistikleri
        if (log.category in stats.byCategory) {
          stats.byCategory[log.category as LogCategory]++;
        }

        // Son 24 saatteki hatalar
        if (log.level === 'error' && new Date(log.created_at || log.timestamp) > last24Hours) {
          stats.recentErrors++;
        }

        // Ortalama response time
        if (log.duration) {
          totalDuration += log.duration;
          durationCount++;
        }
      });

      if (durationCount > 0) {
        stats.averageResponseTime = totalDuration / durationCount;
      }

      return stats;
    } catch (error: any) {
      console.error('❌ Error getting log stats:', error);
      return {
        total: 0,
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
    }
  }
}; 