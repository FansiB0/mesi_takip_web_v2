export interface User {
  id: string;
  name: string;
  email: string;
  startDate: string;
  role: 'admin' | 'user';
  employeeType: 'normal' | 'manager' | 'admin';
  avatar?: string;
  department?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id?: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  startDate: string;
  userId: string;
  created_at?: string;
  updated_at?: string;
}

export interface Salary {
  id?: string;
  userId: string;
  month: number; // 1-12 arası integer
  year: number;
  grossSalary: number;
  netSalary: number;
  bonus: number;
  besDeduction: number;
  created_at?: string;
  updated_at?: string;
}

export interface Overtime {
  id?: string;
  userId: string;
  employeeId?: string; // Supabase uyumluluğu için
  date: string;
  hours: number;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  isRecurring: boolean;
  description?: string;
}

export interface Leave {
  id?: string;
  userId: string;
  employeeId?: string; // Supabase uyumluluğu için
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  type: 'annual' | 'sick' | 'personal' | 'other'; // ERD'ye göre
  leaveType: 'annual' | 'unpaid' | 'sick' | 'maternity' | 'bereavement' | 'administrative' | 'personal' | 'other';
  daysUsed: number;
  created_at?: string;
  updated_at?: string;
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