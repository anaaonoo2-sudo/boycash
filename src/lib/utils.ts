/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
