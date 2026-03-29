export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: any;
}

export interface User {
  id: string;
  name?: string;
  phone?: string;
  telegramId?: string;
  role: 'CLIENT' | 'SPECIALIST' | 'ADMIN';
  createdAt: string;
  specialist?: Specialist;
}

export interface Specialist {
  id: string;
  userId: string;
  rating: number;
  bio?: string;
  location?: string;
  documents: string[];
  isVerified: boolean;
  user?: User;
  services?: { id: string; category?: Category }[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  parentId?: string;
  subCategories?: Category[];
}

export interface Order {
  id: string;
  status: OrderStatus;
  description: string;
  address?: string;
  photos: string[];
  createdAt: string;
  client?: User;
  specialist?: Specialist & { user?: User };
  category?: Category;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  totalSpecialists: number;
  pendingSpecialists: number;
  completedOrders: number;
}

export interface PriceItem {
  id: string;
  categoryId: string;
  name: string;
  unit: string;
  minPrice: number;
  maxPrice?: number;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  category?: Category;
}

