/**
 * Formats a number as German Euro currency (e.g., "14.850,20 €")
 */
export function formatEuro(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats a date string to German standard DD.MM.YYYY
 */
export function formatDateGerman(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Formats an IBAN with spaces every 4 characters
 */
export function formatIban(iban: string): string {
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Financial calculation for German installment loans (Annuitätendarlehen)
 */
export function calculateCreditRate(
  amount: number,
  termMonths: number,
  annualInterestRatePercent: number = 3.89
): {
  monthlyRate: number;
  totalAmount: number;
  totalInterest: number;
  effectiveRate: number;
} {
  if (amount <= 0 || termMonths <= 0) {
    return { monthlyRate: 0, totalAmount: 0, totalInterest: 0, effectiveRate: annualInterestRatePercent };
  }

  const monthlyInterestRate = annualInterestRatePercent / 100 / 12;
  
  // Annuity formula: R = P * (i * (1+i)^n) / ((1+i)^n - 1)
  const factor = Math.pow(1 + monthlyInterestRate, termMonths);
  const monthlyRate = (amount * monthlyInterestRate * factor) / (factor - 1);
  const totalAmount = monthlyRate * termMonths;
  const totalInterest = totalAmount - amount;

  return {
    monthlyRate: Math.round(monthlyRate * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    effectiveRate: annualInterestRatePercent,
  };
}

/**
 * Generiert eine authentische deutsche Bankvertrags- / Antragsnummer (z.B. KR-2026-40858)
 */
export function generateDemoId(prefix: string = 'KR'): string {
  const cleanPrefix = prefix.replace(/^DEMO-?/i, '') || 'KR';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${cleanPrefix}-${year}-${randomNum}`;
}

export function generateContractId(prefix: string = 'KR'): string {
  return generateDemoId(prefix);
}
