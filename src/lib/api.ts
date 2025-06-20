// lib/api.ts
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    withCredentials: true,
  },
})

// Attach token from localStorage to all requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

// GET request
export const get = async <T = any>(url: string, params?: any): Promise<T> => {
  const response = await api.get(url, { params })
  return response.data
}

// POST request
export const post = async <T = any>(url: string, data?: any): Promise<T> => {
  if (data instanceof FormData) {
    const response = await api.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  const response = await api.post(url, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}


export default api
