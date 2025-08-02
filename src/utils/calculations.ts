import { CompensationCalculation } from '../types';

// Brüt maaştan net maaşa çevirme
export const calculateNetSalary = (grossSalary: number, besDeduction: number = 0): number => {
  // Türkiye vergi hesaplamaları (2024)
  const incomeTax = grossSalary * 0.15; // 15% gelir vergisi (basitleştirilmiş)
  const stampTax = grossSalary * 0.00759; // 0.759% damga vergisi
  const ssgDeduction = grossSalary * 0.14; // 14% SSK kesintisi
  const unemploymentDeduction = grossSalary * 0.01; // 1% işsizlik sigortası
  
  const totalDeductions = incomeTax + stampTax + ssgDeduction + unemploymentDeduction + besDeduction;
  return Math.max(0, grossSalary - totalDeductions);
};

// Net maaştan brüt maaşa çevirme
export const calculateGrossSalary = (netSalary: number, besDeduction: number = 0): number => {
  // Net maaş = Brüt maaş - (Brüt maaş * toplam kesinti oranı)
  // Net maaş = Brüt maaş * (1 - toplam kesinti oranı)
  // Brüt maaş = Net maaş / (1 - toplam kesinti oranı)
  
  const totalDeductionRate = 0.15 + 0.00759 + 0.14 + 0.01; // Toplam kesinti oranı
  const adjustedNetSalary = netSalary + besDeduction; // BES kesintisini net maaşa ekle
  
  return adjustedNetSalary / (1 - totalDeductionRate);
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