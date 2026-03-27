import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db';
import logger from './config/logger';

// Routes
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import specialistRoutes from './routes/specialist.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import reviewRoutes from './routes/review.routes';
import { setupBot } from './bot';

dotenv.config();

// ── Muhit o'zgaruvchilarini tekshirish ────────────────────────────────────────
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter(k => !process.env[k]);
if (missingEnv.length > 0) {
  logger.fatal({ missingEnv }, 'Zaruriy muhit o\'zgaruvchilari topilmadi! Server to\'xtatildi.');
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);
const isDev = process.env.NODE_ENV !== 'production';

// ── CORS — faqat ruxsat etilgan domenlar ─────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  // Dev paytida local'ni ruxsat berish
  ...(isDev ? ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'] : []),
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    // Server-side so'rovlar (curl, postman dev'da)
    if (!origin && isDev) return callback(null, true);
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: "${origin}" domeniga ruxsat yo'q`));
  },
  credentials: true,
};

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: corsOptions as any,
  pingTimeout: 20000,
  pingInterval: 25000,
});

io.on('connection', (socket) => {
  if (isDev) logger.debug({ socketId: socket.id }, 'Socket connected');

  socket.on('join_order', (orderId: string) => {
    socket.join(orderId);
  });

  socket.on('send_message', ({ orderId, message }: { orderId: string; message: any }) => {
    io.to(orderId).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    if (isDev) logger.debug({ socketId: socket.id }, 'Socket disconnected');
  });
});

// ── Socket'ni request'ga ulash ───────────────────────────────────────────────
app.use((req: any, _res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 20,                   // 15 daqiqada max 20 urinish
  message: { success: false, message: 'Juda ko\'p urinish. 15 daqiqadan so\'ng qayta urinib ko\'ring.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 daqiqa
  max: 120,            // 1 daqiqada max 120 so'rov
  message: { success: false, message: 'Juda ko\'p so\'rov yuborildi. Keyinroq urinib ko\'ring.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,   // Dev muhitda o'chirib qo'yish
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.set('trust proxy', 1); // Reverse proxy (Railway, Render) uchun

// ── Security headers ──────────────────────────────────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ── DB ulanish ────────────────────────────────────────────────────────────────
connectDB();

// ── Telegram Bot ──────────────────────────────────────────────────────────────
setupBot();

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'ProFix.uz API ishlamoqda 🚀',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', apiLimiter);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/specialists', specialistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Sahifa topilmadi' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, stack: err.stack }, 'Unhandled error');
  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message : 'Server xatosi yuz berdi',
  });
});

// ── Server ishga tushirish ────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);
httpServer.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, '✅ Server ishga tushdi');
});

export { io };

