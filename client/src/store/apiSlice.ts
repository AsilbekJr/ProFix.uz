import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type {
  ApiResponse,
  AuthResponse,
  Category,
  Order,
  Specialist,
  User,
  Review,
} from '../types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Order', 'Category', 'Specialist', 'User', 'Review'],

  endpoints: (builder) => ({
    // ── AUTH ──────────────────────────────────────────────
    registerOrLogin: builder.mutation<AuthResponse, { phone: string; name?: string; password?: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation<AuthResponse, { phone: string; password?: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    telegramAuth: builder.mutation<AuthResponse, { telegramId: string; name?: string }>({
      query: (body) => ({ url: '/auth/telegram', method: 'POST', body }),
    }),

    // ── USERS ─────────────────────────────────────────────
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateMe: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (body) => ({ url: '/users/me', method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),

    // ── CATEGORIES ────────────────────────────────────────
    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),

    // ── ORDERS ────────────────────────────────────────────
    getMyOrders: builder.query<ApiResponse<Order[]>, void>({
      query: () => '/orders/my',
      providesTags: ['Order'],
    }),
    getOpenTenders: builder.query<ApiResponse<Order[]>, void>({
      query: () => '/orders/tenders',
      providesTags: ['Order'],
    }),
    getOrderById: builder.query<ApiResponse<Order>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<ApiResponse<Order>, FormData>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation<
      ApiResponse<Order>,
      { id: string; status: Order['status']; specialistId?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Order', id }, 'Order'],
    }),
    cancelOrder: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/orders/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Order'],
    }),

    // ── SPECIALISTS ───────────────────────────────────────
    getSpecialists: builder.query<ApiResponse<Specialist[]>, { categoryId?: string; district?: string; location?: string }>({
      query: (params) => ({ url: '/specialists', params }),
      providesTags: ['Specialist'],
    }),
    getSpecialistById: builder.query<ApiResponse<Specialist>, string>({
      query: (id) => `/specialists/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Specialist', id }],
    }),
    rateSpecialist: builder.mutation<ApiResponse<Specialist>, { id: string; rating: number }>({
      query: ({ id, rating }) => ({ url: `/specialists/${id}/rate`, method: 'POST', body: { rating } }),
      invalidatesTags: ['Specialist'],
    }),
    applyAsSpecialist: builder.mutation<ApiResponse<Specialist>, FormData>({
      query: (body) => ({ url: '/specialists/apply', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateSpecialistMe: builder.mutation<ApiResponse<Specialist>, Partial<Specialist>>({
      query: (body) => ({ url: '/specialists/me', method: 'PUT', body }),
      invalidatesTags: ['Specialist', 'User'],
    }),
    
    // ── REVIEWS ───────────────────────────────────────────
    createReview: builder.mutation<ApiResponse<Review>, { orderId: string; rating: number; comment?: string }>({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: ['Order', 'Specialist'],
    }),
    getSpecialistReviews: builder.query<ApiResponse<Review[]>, string>({
      query: (specialistId) => `/reviews/specialist/${specialistId}`,
      providesTags: ['Review'],
    }),
  }),
});

export const {
  useRegisterOrLoginMutation,
  useLoginMutation,
  useTelegramAuthMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useGetCategoriesQuery,
  useGetMyOrdersQuery,
  useGetOpenTendersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useGetSpecialistsQuery,
  useGetSpecialistByIdQuery,
  useUpdateSpecialistMeMutation,
  useRateSpecialistMutation,
  useApplyAsSpecialistMutation,
  useCreateReviewMutation,
  useGetSpecialistReviewsQuery,
} = api;
