// lib/api.ts
import axios, { AxiosRequestConfig } from 'axios'

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
      config.headers!['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

/**
 * Standard GET (JSON) helper
 */
export const get = async <T = any>(url: string, params?: any): Promise<T> => {
  const response = await api.get<T>(url, { params })
  return response.data
}

/**
 * Standard POST (JSON or FormData) helper
 */
export const post = async <T = any>(url: string, data?: any, opts?: { signal?: AbortSignal }): Promise<T> => {
  // allow FormData uploads
  if (data instanceof FormData) {
    const response = await api.post<T>(url, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal: opts?.signal,
    })
    return response.data
  }

  const response = await api.post<T>(url, data)
  return response.data
}

export const downloadBlob = async (
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<Blob> => {
  const opts: AxiosRequestConfig = {
    responseType: 'blob',
    ...config,
  }

  let response
  if (data instanceof FormData) {
    response = await api.post<Blob>(url, data, {
      ...opts,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  } else {
    response = await api.post<Blob>(url, data, opts)
  }

  return response.data
}

export default api
