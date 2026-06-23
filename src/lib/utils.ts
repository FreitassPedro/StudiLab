import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um objeto Date local gerando a string "YYYY-MM-DD".
 * Usa os componentes locais (getFullYear, getMonth, getDate).
 */
export function formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata um objeto Date vindo do Prisma (@db.Date) gerando a string "YYYY-MM-DD".
 * Como o Prisma envia as datas de campo Date como meia-noite UTC, usamos os componentes UTC.
 */
export function formatDateFromDB(date: Date | string): string {
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    date = new Date(date);
  }
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converte a string "YYYY-MM-DD" num objeto Date local referente à meia-noite do dia.
 */
export function parseLocalStringToDate(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid date string for parseLocalStringToDate: ${dateStr}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day);
}

/**
 * Converte um Date vindo do Prisma (@db.Date) (UTC midnight) em um Date Local
 * que representa o mesmo dia. Útil para bibliotecas da UI como date-fns.
 */
export function parseDbDateToLocal(dateInput: Date | string): Date {
  if (typeof dateInput === 'string') {
    return parseLocalStringToDate(dateInput);
  }
  return new Date(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate());
}

/**
 * Retorna a data local atual truncada para meia-noite (hora 00:00:00).
 */
export function getTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

