import api from './axios'

// ── Auth ──────────────────────────────────────────
export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: object) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  changePassword: (data: object) => api.put('/auth/change-password', data),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken })
}

// ── Products ──────────────────────────────────────
export const productsApi = {
  getAll: (params?: object) => api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: object) => api.post('/products', data),
  update: (id: number, data: object) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
  getCategories: () => api.get('/products/categories')
}

// ── Inventory ─────────────────────────────────────
export const inventoryApi = {
  getLogs: (params?: object) => api.get('/inventory/logs', { params }),
  getLogsByProduct: (productId: number) =>
    api.get(`/inventory/logs/product/${productId}`),
  add: (data: object) => api.post('/inventory/add', data),
  sell: (data: object) => api.post('/inventory/sell', data),
  adjust: (data: object) => api.post('/inventory/adjust', data),
  return: (data: object) => api.post('/inventory/return', data)
}

// ── Dashboard ─────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getActivityChart: (days?: number) =>
    api.get('/dashboard/activity-chart', { params: { days } }),
  getCategoryBreakdown: () => api.get('/dashboard/category-breakdown'),
  getTopProducts: (limit?: number) =>
    api.get('/dashboard/top-products', { params: { limit } })
}

// ── Users ─────────────────────────────────────────
export const usersApi = {
  getAll: (params?: object) => api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: object) => api.put(`/users/${id}`, data),
  toggleStatus: (id: number) => api.patch(`/users/${id}/toggle-status`),
  delete: (id: number) => api.delete(`/users/${id}`)
}
