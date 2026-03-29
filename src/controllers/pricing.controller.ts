import { Request, Response } from 'express';
import prisma from '../config/db';

// ── GET /api/admin/pricing — barcha narxlar (category bilan) ─────────────────
export const getPriceItems = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    const where = categoryId ? { categoryId: String(categoryId) } : {};

    const items = await prisma.priceItem.findMany({
      where,
      include: { category: { select: { id: true, name: true, icon: true } } },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });

    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/admin/pricing ───────────────────────────────────────────────────
export const createPriceItem = async (req: Request, res: Response) => {
  try {
    const { categoryId, name, unit, minPrice, maxPrice, description, sortOrder } = req.body;

    if (!categoryId || !name || minPrice == null) {
      return res.status(400).json({ success: false, message: 'categoryId, name, minPrice majburiy' });
    }

    const item = await prisma.priceItem.create({
      data: {
        categoryId,
        name: name.trim(),
        unit: unit || 'xizmat',
        minPrice: parseFloat(minPrice),
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        description: description?.trim() || null,
        sortOrder: sortOrder || 0,
      },
      include: { category: { select: { id: true, name: true, icon: true } } },
    });

    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/admin/pricing/:id ────────────────────────────────────────────────
export const updatePriceItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, unit, minPrice, maxPrice, description, sortOrder, isActive } = req.body;

    const item = await prisma.priceItem.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(unit && { unit }),
        ...(minPrice != null && { minPrice: parseFloat(minPrice) }),
        ...(maxPrice !== undefined && { maxPrice: maxPrice ? parseFloat(maxPrice) : null }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(sortOrder != null && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { category: { select: { id: true, name: true, icon: true } } },
    });

    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/admin/pricing/:id ─────────────────────────────────────────────
export const deletePriceItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.priceItem.delete({ where: { id } });
    res.json({ success: true, message: "O'chirildi" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/pricing (public) — frontend uchun ───────────────────────────────
export const getPublicPricing = async (_req: Request, res: Response) => {
  try {
    const items = await prisma.priceItem.findMany({
      where: { isActive: true },
      include: { category: { select: { id: true, name: true, icon: true } } },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    });

    // Category bo'yicha guruhlash
    const grouped: Record<string, any> = {};
    for (const item of items) {
      const catId = item.categoryId;
      if (!grouped[catId]) {
        grouped[catId] = {
          category: item.category,
          items: [],
        };
      }
      grouped[catId].items.push({
        id: item.id,
        name: item.name,
        unit: item.unit,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        description: item.description,
      });
    }

    res.json({ success: true, data: Object.values(grouped) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
