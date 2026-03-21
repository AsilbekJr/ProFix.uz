import { Request, Response } from 'express';
import prisma from '../config/db';

export const getCategories = async (_req: Request, res: Response) : Promise<any> => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { subCategories: true }
    });
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) : Promise<any> => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { subCategories: true, parent: true }
    });
    if (!category) return res.status(404).json({ success: false, message: 'Kategoriya topilmadi' });
    res.json({ success: true, data: category });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCategory = async (req: Request, res: Response) : Promise<any> => {
  try {
    const { name, parentId, icon } = req.body;
    const category = await prisma.category.create({ data: { name, parentId, icon } });
    res.status(201).json({ success: true, data: category });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req: Request, res: Response) : Promise<any> => {
  try {
    const { name, icon } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, icon }
    });
    res.json({ success: true, data: category });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) : Promise<any> => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Kategoriya o\'chirildi' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
