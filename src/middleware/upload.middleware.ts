import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

// Faqat rasmlar (buyurtmalar uchun)
const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Faqat rasm fayllari qabul qilinadi (JPEG, PNG, WebP)'));
  }
};

// Rasm + hujjatlar (mutaxassis ariza uchun)
const documentFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat rasm (JPEG, PNG), PDF yoki DOC fayllari qabul qilinadi'));
  }
};

export const uploadOrderPhotos = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 } // 5MB, max 5 ta
}).array('photos', 5);

export const uploadSpecialistDocs = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 } // 10MB, max 5 ta
}).array('documents', 5);

