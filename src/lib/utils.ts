import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte uma string de data (YYYY-MM-DD) ou Date do PostgreSQL para uma Date local
 * sem problemas de timezone. Útil para campos @db.Date do Prisma quando usados na UI.
 * 
 * Problema: new Date("2026-03-02") interpreta como UTC e causa shift de timezone
 * Solução: Extrai os componentes e cria data local explicitamente
 */
export function parseDateAsLocal(dateInput: Date | string): Date {
  if (dateInput instanceof Date) {
    // Para Date objects vindos do Prisma (@db.Date vem como UTC midnight),
    // usar componentes UTC para evitar shift de timezone
    return new Date(
      dateInput.getUTCFullYear(),
      dateInput.getUTCMonth(),
      dateInput.getUTCDate()
    );
  }

  // Aceita "YYYY-MM-DD" e também datetime ISO, extraindo apenas a parte da data
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateInput);
  if (!match) {
    throw new Error(`Invalid date string for parseDateAsLocal: ${dateInput}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day);
}

/**
 * Formata Date ou string de data para "YYYY-MM-DD"
 * Usa UTC para extrair componentes quando é Date (padrão Prisma para @db.Date)
 */
export function formatDateKey(date: Date | string): string {
  if (typeof date === 'string') {
    // Se já é string no formato correto, retorna direto
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Senão, converte para Date primeiro
    date = new Date(date);
  }
  
  // Usar UTC para evitar problemas de timezone com @db.Date do Prisma
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Cria uma data local respeitando a timezone do cliente/navegador.
 * Criar uma data local sem problemas de conversão timezone.
 * 
 * Problema: `new Date()` no servidor retorna UTC, causando deslocamento para usuários brasileiros.
 * Solução: Extrair componentes da data local do cliente e criar Date respeitando a timezone local.
 */
export function getLocalDateForToday(): Date {
  const now = new Date();
  // Cria uma data usando os componentes locais (não UTC)
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}
