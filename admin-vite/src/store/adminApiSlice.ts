import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse, User, Order, Category, Specialist, DashboardStats, PriceItem } from '@/types';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  if (!url.endsWith('/api') && !url.includes('/api/')) {
    url = url.replace(/\/$/, '') + '/api';
  }
  return url;
};

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['User', 'Order', 'Specialist', 'Category', 'Stats', 'PriceItem'],
  // Cache data for 5 minutes — avoids re-fetching on every page navigation
  keepUnusedDataFor: 300,
  refetchOnFocus: false,
  refetchOnReconnect: false,

  endpoints: (builder) => ({
    // ── DASHBOARD ──────────────────────────────────────────
    getStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),

    // ── AUTH ───────────────────────────────────────────────
    adminLogin: builder.mutation<{ success: boolean; token: string; user: User }, { phone: string; password?: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),


    // ── USERS ──────────────────────────────────────────────
    getUsers: builder.query<ApiResponse<User[]>, { page?: number; role?: string }>({
      query: (params) => ({ url: '/admin/users', params }),
      providesTags: ['User'],
    }),
    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    // ── ORDERS ─────────────────────────────────────────────
    getAllOrders: builder.query<ApiResponse<Order[]>, { status?: string; page?: number }>({
      query: (params) => ({ url: '/admin/orders', params }),
      providesTags: ['Order'],
    }),
    assignSpecialist: builder.mutation<ApiResponse<Order>, { orderId: string; specialistId: string }>({
      query: ({ orderId, specialistId }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PUT',
        body: { status: 'ACCEPTED', specialistId },
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation<ApiResponse<Order>, { orderId: string; status: string; specialistId?: string }>({
      query: ({ orderId, ...body }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Order'],
    }),

    // ── SPECIALISTS ────────────────────────────────────────
    getPendingSpecialists: builder.query<ApiResponse<Specialist[]>, void>({
      query: () => '/specialists?verified=false',
      providesTags: ['Specialist'],
    }),
    getAllSpecialists: builder.query<ApiResponse<Specialist[]>, void>({
      query: () => '/specialists?verified=all',
      providesTags: ['Specialist'],
    }),
    verifySpecialist: builder.mutation<ApiResponse<Specialist>, string>({
      query: (id) => ({ url: `/specialists/${id}/verify`, method: 'PUT' }),
      invalidatesTags: ['Specialist', 'Stats'],
    }),
    unverifySpecialist: builder.mutation<ApiResponse<Specialist>, string>({
      query: (id) => ({ url: `/specialists/${id}/unverify`, method: 'PUT' }),
      invalidatesTags: ['Specialist', 'Stats'],
    }),

    // ── CATEGORIES ─────────────────────────────────────────
    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<ApiResponse<Category>, { name: string; icon?: string; parentId?: string }>({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<ApiResponse<Category>, { id: string; name: string; icon?: string }>({
      query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),
    // ── PRICING ────────────────────────────────────────────
    getAdminPricing: builder.query<ApiResponse<PriceItem[]>, { categoryId?: string }>({
      query: (params) => ({ url: '/pricing/admin', params }),
      providesTags: ['PriceItem'],
    }),
    createPriceItem: builder.mutation<ApiResponse<PriceItem>, Partial<PriceItem>>({
      query: (body) => ({ url: '/pricing/admin', method: 'POST', body }),
      invalidatesTags: ['PriceItem'],
    }),
    updatePriceItem: builder.mutation<ApiResponse<PriceItem>, Partial<PriceItem> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/pricing/admin/${id}`, method: 'PUT', body }),
      invalidatesTags: ['PriceItem'],
    }),
    deletePriceItem: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/pricing/admin/${id}`, method: 'DELETE' }),
      invalidatesTags: ['PriceItem'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useAdminLoginMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetAllOrdersQuery,
  useAssignSpecialistMutation,
  useUpdateOrderStatusMutation,
  useGetPendingSpecialistsQuery,
  useGetAllSpecialistsQuery,
  useVerifySpecialistMutation,
  useUnverifySpecialistMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAdminPricingQuery,
  useCreatePriceItemMutation,
  useUpdatePriceItemMutation,
  useDeletePriceItemMutation,
} = adminApi;
