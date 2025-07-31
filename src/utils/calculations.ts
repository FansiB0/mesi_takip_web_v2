import { CompensationCalculation } from '../types';

export const calculateNetSalary = (grossSalary: number, besDeduction: number = 0): number => {
  // Turkish tax calculations (simplified)
  const incomeTax = grossSalary * 0.15; // 15% income tax (simplified)
  const stampTax = grossSalary * 0.00759; // 0.759% stamp tax
  const ssgDeduction = grossSalary * 0.14; // 14% SSK deduction
  const unemploymentDeduction = grossSalary * 0.01; // 1% unemployment insurance
  
  const totalDeductions = incomeTax + stampTax + ssgDeduction + unemploymentDeduction + besDeduction;
  return Math.max(0, grossSalary - totalDeductions);
};

export const calculateOvertimePay = (
  hours: number, 
  hourlyRate: number, 
  overtimeType: 'normal' | 'weekend' | 'holiday'
): number => {
  const multipliers = {
    normal: 1.5,
    weekend: 2.0,
    holiday: 2.0
  };
  
  return hours * hourlyRate * multipliers[overtimeType];
};

export const calculateSeverancePay = (
  grossSalary: number, 
  startDate: string, 
  endDate: string = new Date().toISOString()
): CompensationCalculation => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const workingDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const workingYears = workingDays / 365.25;
  
  const grossAmount = grossSalary * workingYears;
  const stampTax = grossAmount * 0.00759;
  const netAmount = grossAmount - stampTax;
  
  return {
    grossAmount,
    stampTax,
    netAmount,
    workingDays
  };
};

export const calculateUnemploymentBenefits = (lastFourSalaries: number[]): CompensationCalculation => {
  if (lastFourSalaries.length !== 4) {
    throw new Error('Son 4 ayın maaş bilgisi gereklidir');
  }
  
  const averageSalary = lastFourSalaries.reduce((sum, salary) => sum + salary, 0) / 4;
  const grossAmount = averageSalary * 0.60; // 60% of average salary
  const netAmount = calculateNetSalary(grossAmount);
  const stampTax = grossAmount - netAmount;
  
  return {
    grossAmount,
    stampTax,
    netAmount,
    averageSalary
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};