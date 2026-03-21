import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPhone = (val: string) => {
  let digits = val.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    return '+' + digits.slice(0, 12);
  }
  if (digits.length === 0 || (digits.length <= 3 && '998'.startsWith(digits))) {
    return '+998';
  }
  digits = '998' + digits;
  return '+' + digits.slice(0, 12);
};
