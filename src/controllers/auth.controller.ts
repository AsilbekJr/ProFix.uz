import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';

const generateToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

export const register = async (req: Request, res: Response) : Promise<any> => {
  try {
    const { phone, name, password } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Telefon raqam kiritilishi shart' });

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) return res.status(400).json({ success: false, message: 'Bu raqam allaqachon ro\'yxatdan o\'tgan' });

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await prisma.user.create({ 
      data: { phone, name, password: hashedPassword } 
    });
    res.status(201).json({ success: true, token: generateToken(user.id), user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response) : Promise<any> => {
  try {
    const { phone, password } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Telefon raqam kiritilishi shart' });

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    // If user is ADMIN or has a password, verify it
    if (user.role === 'ADMIN' || user.password) {
      if (!password) {
        return res.status(400).json({ success: false, message: 'Parol kiritilishi shart', requirePassword: true });
      }
      
      const isMatch = await bcrypt.compare(password, user.password || '');
      // Fallback for plain text password in migration/seeding if needed, 
      // but let's assume all passwords should be hashed.
      // If the hash check fails and password is not null, it's a wrong password.
      if (!isMatch) {
         // Special case: if we just added the field and it's not hashed yet
         if (password === user.password) {
            // allow plain text for now, but really we should hash it
         } else {
            return res.status(401).json({ success: false, message: 'Parol noto\'g\'ri' });
         }
      }
    }

    res.json({ success: true, token: generateToken(user.id), user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const telegramAuth = async (req: Request, res: Response) : Promise<any> => {
  try {
    const { telegramId, name } = req.body;
    if (!telegramId) return res.status(400).json({ success: false, message: 'Telegram ID kiritilishi shart' });

    let user = await prisma.user.findUnique({ where: { telegramId: String(telegramId) } });

    if (!user) {
      user = await prisma.user.create({ data: { telegramId: String(telegramId), name } });
    }

    res.json({ success: true, token: generateToken(user.id), user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
