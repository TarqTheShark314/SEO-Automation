import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/token', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// Sites
export const sitesAPI = {
  list: () => api.get('/sites/'),
  get: (id: number) => api.get(`/sites/${id}`),
  create: (data: { domain: string; name: string }) => api.post('/sites/', data),
  delete: (id: number) => api.delete(`/sites/${id}`),
}

// Audits
export const auditsAPI = {
  list: (siteId: number) => api.get(`/audits/?site_id=${siteId}`),
  get: (id: number) => api.get(`/audits/${id}`),
  create: (siteId: number) => api.post('/audits/', { site_id: siteId }),
}

// Optimizations
export const optimizationsAPI = {
  list: (siteId: number) => api.get(`/optimizations/?site_id=${siteId}`),
  get: (id: number) => api.get(`/optimizations/${id}`),
  approve: (id: number) => api.post(`/optimizations/${id}/approve`),
  reject: (id: number) => api.post(`/optimizations/${id}/reject`),
  deploy: (id: number) => api.post(`/optimizations/${id}/deploy`),
}

// Content
export const contentAPI = {
  list: (siteId: number) => api.get(`/content/?site_id=${siteId}`),
  get: (id: number) => api.get(`/content/${id}`),
  generate: (data: {
    site_id: number
    topic: string
    content_type: string
    focus_keyword?: string
    secondary_keywords?: string[]
    target_word_count?: number
    tone?: string
  }) => api.post('/content/generate', data),
}

// Local SEO
export const localSeoAPI = {
  locations: (siteId: number) => api.get(`/local-seo/locations?site_id=${siteId}`),
  reviews: (locationId: number) => api.get(`/local-seo/reviews?location_id=${locationId}`),
  posts: (locationId: number) => api.get(`/local-seo/posts?location_id=${locationId}`),
  generatePost: (data: { location_id: number; post_type: string; topic?: string }) =>
    api.post('/local-seo/posts/generate', data),
  generateReply: (reviewId: number) =>
    api.post(`/local-seo/reviews/${reviewId}/generate-reply`),
}

// GEO SEO
export const geoSeoAPI = {
  visibility: (siteId: number) => api.get(`/geo-seo/visibility?site_id=${siteId}`),
  queries: (siteId: number) => api.get(`/geo-seo/queries?site_id=${siteId}`),
  citations: (siteId: number) => api.get(`/geo-seo/citations?site_id=${siteId}`),
  eeatScores: (siteId: number) => api.get(`/geo-seo/eeat?site_id=${siteId}`),
}

export default api
