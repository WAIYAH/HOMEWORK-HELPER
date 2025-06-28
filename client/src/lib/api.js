import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = window.Clerk?.session?.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const questionAPI = {
  submitQuestion: (data) => api.post('/questions/submit', data),
  getQuestions: () => api.get('/questions'),
  getQuestion: (id) => api.get(`/questions/${id}`),
}

export const paymentAPI = {
  initiatePayment: (data) => api.post('/payments/initiate', data),
  verifyPayment: (transactionId) => api.get(`/payments/verify/${transactionId}`),
  getPaymentHistory: () => api.get('/payments/history'),
}

export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  subscribe: (planId) => api.post('/subscriptions/subscribe', { planId }),
  getSubscription: () => api.get('/subscriptions/current'),
}

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getBadges: () => api.get('/users/badges'),
}

export default api