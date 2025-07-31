export interface User {
  id: string;
  name: string;
  email: string;
  startDate: string;
  employeeType: 'normal' | 'manager';
  avatar?: string;
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
}

export interface Overtime {
  id: string;
  userId: string;
  date: string;
  hours: number;
  overtimeType: 'normal' | 'weekend' | 'holiday';
  hourlyRate: number;
  totalPayment: number;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  isRecurring: boolean;
}

export interface Leave {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  daysUsed: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  leaveType: 'paid' | 'unpaid' | 'annual' | 'maternity' | 'bereavement' | 'administrative';
}

export interface CompensationCalculation {
  grossAmount: number;
  stampTax: number;
  netAmount: number;
  workingDays?: number;
  averageSalary?: number;
}