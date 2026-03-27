import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    phone: z.string().min(9, 'Telefon raqam kamida 9 belgi bo\'lishi kerak'),
    name: z.string().min(2, 'Ism kamida 2 beligidan iborat bo\'lishi kerak'),
    password: z.string().min(6, 'Parol kamida 6 belgidan iborat bo\'lishi kerak'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().min(9, 'Telefon raqam kiritilishi shart'),
    password: z.string().optional(),
  }),
});

export const telegramAuthSchema = z.object({
  body: z.object({
    telegramId: z.union([z.string(), z.number()]),
    name: z.string().optional(),
  }),
});
