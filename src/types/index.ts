export interface User {
  id: string;
  name: string;
  email: string;
  startDate: string;
  employeeType: 'normal' | 'manager' | 'admin';
  avatar?: string;
  department?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Salary {
  id: string;
  userId: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  bonus: number;
  besDeduction: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Overtime {
  id: string;
  userId: string;
  employeeId?: string; // Firebase uyumluluğu için
  date: string;
  hours: number;
  overtimeType: 'normal' | 'weekend' | 'holiday';
  hourlyRate: number;
  totalPayment: number;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  isRecurring: boolean;
  description?: string;
}

export interface Leave {
  id: string;
  userId: string;
  employeeId?: string; // Firebase uyumluluğu için
  startDate: string;
  endDate: string;
  daysUsed: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  leaveType: 'paid' | 'unpaid' | 'annual' | 'maternity' | 'bereavement' | 'administrative';
  type: 'annual' | 'sick' | 'personal' | 'other'; // Firebase uyumluluğu için
  createdAt?: string;
  updatedAt?: string;
}

export interface CompensationCalculation {
  grossAmount: number;
  stampTax: number;
  netAmount: number;
  workingDays?: number;
  averageSalary?: number;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  retryCount?: number;
}