import { ValidationError, FormValidationResult } from '../types';

// Genel validasyon fonksiyonları
export const validators = {
  required: (value: any, fieldName: string): ValidationError | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { field: fieldName, message: `${fieldName} alanı zorunludur` };
    }
    return null;
  },

  email: (value: string, fieldName: string): ValidationError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return { field: fieldName, message: 'Geçerli bir email adresi giriniz' };
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): ValidationError | null => {
    if (value && value.length < min) {
      return { field: fieldName, message: `${fieldName} en az ${min} karakter olmalıdır` };
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): ValidationError | null => {
    if (value && value.length > max) {
      return { field: fieldName, message: `${fieldName} en fazla ${max} karakter olmalıdır` };
    }
    return null;
  },

  positiveNumber: (value: number, fieldName: string): ValidationError | null => {
    if (value !== undefined && value < 0) {
      return { field: fieldName, message: `${fieldName} pozitif bir sayı olmalıdır` };
    }
    return null;
  },

  date: (value: string, fieldName: string): ValidationError | null => {
    if (value && isNaN(Date.parse(value))) {
      return { field: fieldName, message: 'Geçerli bir tarih giriniz' };
    }
    return null;
  },

  futureDate: (value: string, fieldName: string): ValidationError | null => {
    if (value && new Date(value) <= new Date()) {
      return { field: fieldName, message: `${fieldName} gelecek bir tarih olmalıdır` };
    }
    return null;
  },

  pastDate: (value: string, fieldName: string): ValidationError | null => {
    if (value && new Date(value) >= new Date()) {
      return { field: fieldName, message: `${fieldName} geçmiş bir tarih olmalıdır` };
    }
    return null;
  },

  dateRange: (startDate: string, endDate: string): ValidationError | null => {
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return { field: 'dateRange', message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' };
    }
    return null;
  },

  hours: (value: number, fieldName: string): ValidationError | null => {
    if (value !== undefined && (value <= 0 || value > 24)) {
      return { field: fieldName, message: `${fieldName} 0-24 saat arasında olmalıdır` };
    }
    return null;
  },

  salary: (value: number, fieldName: string): ValidationError | null => {
    if (value !== undefined && value < 0) {
      return { field: fieldName, message: `${fieldName} negatif olamaz` };
    }
    if (value !== undefined && value > 1000000) {
      return { field: fieldName, message: `${fieldName} çok yüksek bir değer` };
    }
    return null;
  }
};

// Form validasyon fonksiyonları
export const formValidators = {
  // Kullanıcı kayıt formu
  registerForm: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    startDate: string;
  }): FormValidationResult => {
    const errors: ValidationError[] = [];

    // Name validation
    const nameError = validators.required(data.name, 'Ad Soyad') ||
                     validators.minLength(data.name, 2, 'Ad Soyad') ||
                     validators.maxLength(data.name, 50, 'Ad Soyad');
    if (nameError) errors.push(nameError);

    // Email validation
    const emailError = validators.required(data.email, 'Email') ||
                      validators.email(data.email, 'Email');
    if (emailError) errors.push(emailError);

    // Password validation
    const passwordError = validators.required(data.password, 'Şifre') ||
                         validators.minLength(data.password, 6, 'Şifre');
    if (passwordError) errors.push(passwordError);

    // Confirm password validation
    if (data.password !== data.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Şifreler eşleşmiyor' });
    }

    // Start date validation
    const startDateError = validators.required(data.startDate, 'İşe Başlama Tarihi') ||
                          validators.date(data.startDate, 'İşe Başlama Tarihi') ||
                          validators.pastDate(data.startDate, 'İşe Başlama Tarihi');
    if (startDateError) errors.push(startDateError);

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Giriş formu
  loginForm: (data: { email: string; password: string }): FormValidationResult => {
    const errors: ValidationError[] = [];

    const emailError = validators.required(data.email, 'Email') ||
                      validators.email(data.email, 'Email');
    if (emailError) errors.push(emailError);

    const passwordError = validators.required(data.password, 'Şifre');
    if (passwordError) errors.push(passwordError);

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Mesai formu
  overtimeForm: (data: {
    date: string;
    hours: number;
    overtimeType: string;
    hourlyRate: number;
  }): FormValidationResult => {
    const errors: ValidationError[] = [];

    const dateError = validators.required(data.date, 'Tarih') ||
                     validators.date(data.date, 'Tarih') ||
                     validators.pastDate(data.date, 'Tarih');
    if (dateError) errors.push(dateError);

    const hoursError = validators.required(data.hours, 'Saat') ||
                      validators.hours(data.hours, 'Saat');
    if (hoursError) errors.push(hoursError);

    const hourlyRateError = validators.required(data.hourlyRate, 'Saat Ücreti') ||
                           validators.salary(data.hourlyRate, 'Saat Ücreti');
    if (hourlyRateError) errors.push(hourlyRateError);

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // İzin formu
  leaveForm: (data: {
    startDate: string;
    endDate: string;
    daysUsed: number;
    reason: string;
    leaveType: string;
  }): FormValidationResult => {
    const errors: ValidationError[] = [];

    const startDateError = validators.required(data.startDate, 'Başlangıç Tarihi') ||
                          validators.date(data.startDate, 'Başlangıç Tarihi');
    if (startDateError) errors.push(startDateError);

    const endDateError = validators.required(data.endDate, 'Bitiş Tarihi') ||
                        validators.date(data.endDate, 'Bitiş Tarihi');
    if (endDateError) errors.push(endDateError);

    // Tarih aralığı kontrolü - sadece her iki tarih de varsa kontrol et
    if (data.startDate && data.endDate) {
      const dateRangeError = validators.dateRange(data.startDate, data.endDate);
      if (dateRangeError) errors.push(dateRangeError);
    }

    const daysUsedError = validators.required(data.daysUsed, 'Gün Sayısı') ||
                         validators.positiveNumber(data.daysUsed, 'Gün Sayısı');
    if (daysUsedError) errors.push(daysUsedError);

    // Reason alanı tamamen opsiyonel - hiçbir validation yok
    // Kullanıcı boş bırakabilir

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Maaş formu
  salaryForm: (data: {
    month: string;
    year: number;
    grossSalary: number;
    netSalary: number;
    bonus: number;
    besDeduction: number;
  }): FormValidationResult => {
    const errors: ValidationError[] = [];

    const monthError = validators.required(data.month, 'Ay');
    if (monthError) errors.push(monthError);

    const yearError = validators.required(data.year, 'Yıl');
    if (yearError) errors.push(yearError);

    const grossSalaryError = validators.required(data.grossSalary, 'Brüt Maaş') ||
                            validators.salary(data.grossSalary, 'Brüt Maaş');
    if (grossSalaryError) errors.push(grossSalaryError);

    const netSalaryError = validators.required(data.netSalary, 'Net Maaş') ||
                          validators.salary(data.netSalary, 'Net Maaş');
    if (netSalaryError) errors.push(netSalaryError);

    const bonusError = validators.salary(data.bonus, 'İkramiye');
    if (bonusError) errors.push(bonusError);

    const besDeductionError = validators.salary(data.besDeduction, 'BES Kesintisi');
    if (besDeductionError) errors.push(besDeductionError);

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // XSS koruması
    .replace(/\s+/g, ' '); // Fazla boşlukları temizle
};

// Tarih formatı kontrolü
export const isValidDateFormat = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// Para formatı kontrolü
export const isValidCurrencyFormat = (value: string): boolean => {
  const currencyRegex = /^\d+(\.\d{1,2})?$/;
  return currencyRegex.test(value);
}; 