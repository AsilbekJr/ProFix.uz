import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db';

// Routes
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import specialistRoutes from './routes/specialist.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import reviewRoutes from './routes/review.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const isDev = process.env.NODE_ENV !== 'production';

// ── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || '*' },
  // Production da ping interval optimizatsiyasi
  pingTimeout: 20000,
  pingInterval: 25000,
});

io.on('connection', (socket) => {
  if (isDev) console.log(`🔌 Socket: ${socket.id}`);

  socket.on('join_order', (orderId: string) => {
    socket.join(orderId);
  });

  socket.on('send_message', ({ orderId, message }: { orderId: string; message: any }) => {
    io.to(orderId).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    if (isDev) console.log(`❌ Socket: ${socket.id}`);
  });
});

// ── Socket ni route'larda ishlatish ─────────────────────────────────────────
app.use((req: any, _res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers (minimal)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// ── DB ulanish ───────────────────────────────────────────────────────────────
connectDB();

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'ProFix.uz API ishlamoqda 🚀',
    version: '1.0.0',
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/specialists', specialistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Sahifa topilmadi' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (isDev) console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message : 'Server xatosi',
  });
});

// ── Server ishga tushirish ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server ${PORT}-portda (${process.env.NODE_ENV || 'development'})`);
});

export { io };
