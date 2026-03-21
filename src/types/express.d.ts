import 'express';
import { Server } from 'socket.io';
import { User } from '@prisma/client';

// Express Request interfaceini kengaytirish
declare module 'express-serve-static-core' {
  interface Request {
    io?: Server;
    user?: User;
  }
}
