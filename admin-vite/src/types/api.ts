import type { User, Order, Specialist, Category } from './index';

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

export type { User, Order, Specialist, Category };
