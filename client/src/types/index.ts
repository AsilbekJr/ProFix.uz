// Barcha turdagi interfeys va tiplar shu yerda

export interface User {
  id: string;
  telegramId?: string;
  phone?: string;
  name?: string;
  role: 'CLIENT' | 'SPECIALIST' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  specialist?: Specialist;
}

export interface Specialist {
  id: string;
  userId: string;
  rating: number;
  reviewCount?: number;
  documents: string[];
  bio?: string;
  location?: string;
  isVerified: boolean;
  experienceYear?: number;
  createdAt?: string;
  user?: User;
  services?: Service[];
  portfolios?: Portfolio[];
  reviews?: Review[];
  availabilities?: SpecialistAvailability[];
  _count?: {
    ordersAsSpecialist: number;
  };
}

export interface Portfolio {
  id: string;
  title: string;
  description?: string;
  beforeImage?: string;
  afterImage: string;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  client?: User;
  createdAt: string;
}

export interface SpecialistAvailability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
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
  clientId: string;
  specialistId?: string;
  categoryId: string;
  description: string;
  photos: string[];
  address?: string;
  locationLat?: number;
  locationLng?: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  client?: User;
  specialist?: Specialist & { user?: User };
  secondaryPhone?: string;
  review?: Review;
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Service {
  id: string;
  specialistId: string;
  categoryId: string;
  price?: number;
  category?: Category;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
