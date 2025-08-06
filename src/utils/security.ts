// XSS koruması için input sanitization
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// SQL Injection koruması için karakter temizleme
export const sanitizeSql = (input: string): string => {
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};

// Rate limiting için basit implementasyon
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }

    const requests = this.requests.get(key)!;
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  clear(): void {
    this.requests.clear();
  }
}

// CSRF token oluşturma
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Password strength kontrolü
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Minimum uzunluk kontrolü
  if (password.length < 8) {
    feedback.push('Şifre en az 8 karakter olmalıdır');
  } else {
    score += 1;
  }

  // Büyük harf kontrolü
  if (!/[A-Z]/.test(password)) {
    feedback.push('En az bir büyük harf içermelidir');
  } else {
    score += 1;
  }

  // Küçük harf kontrolü
  if (!/[a-z]/.test(password)) {
    feedback.push('En az bir küçük harf içermelidir');
  } else {
    score += 1;
  }

  // Rakam kontrolü
  if (!/\d/.test(password)) {
    feedback.push('En az bir rakam içermelidir');
  } else {
    score += 1;
  }

  // Özel karakter kontrolü
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('En az bir özel karakter içermelidir');
  } else {
    score += 1;
  }

  const isValid = score >= 4;

  return {
    isValid,
    score,
    feedback
  };
};

// Email format kontrolü
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number format kontrolü
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Dosya uzantısı kontrolü
export const validateFileExtension = (filename: string, allowedExtensions: string[]): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
};

// Dosya boyutu kontrolü (MB cinsinden)
export const validateFileSize = (fileSize: number, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
};

// Input length kontrolü
export const validateInputLength = (input: string, minLength: number, maxLength: number): boolean => {
  return input.length >= minLength && input.length <= maxLength;
};

// Numeric input kontrolü
export const validateNumericInput = (input: string): boolean => {
  return /^\d+(\.\d+)?$/.test(input);
};

// Date format kontrolü (YYYY-MM-DD)
export const validateDateFormat = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// URL format kontrolü
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Sensitive data masking
export const maskSensitiveData = (data: string, type: 'email' | 'phone' | 'creditCard'): string => {
  switch (type) {
    case 'email':
      const [local, domain] = data.split('@');
      return `${local.charAt(0)}***@${domain}`;
    
    case 'phone':
      return data.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3');
    
    case 'creditCard':
      return data.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1****$3****');
    
    default:
      return data;
  }
};

// Session timeout kontrolü
export const checkSessionTimeout = (lastActivity: number, timeoutMinutes: number = 30): boolean => {
  const now = Date.now();
  const timeoutMs = timeoutMinutes * 60 * 1000;
  return (now - lastActivity) > timeoutMs;
};

// Secure random string oluşturma
export const generateSecureRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomArray[i] % chars.length);
  }
  
  return result;
}; 