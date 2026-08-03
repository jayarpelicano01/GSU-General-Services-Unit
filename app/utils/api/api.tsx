import axios from "axios"

export const API = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: true, // Important for HTTP-only cookies
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

// Request interceptor - attach access token
API.interceptors.request.use(
  (config) => {
    // Access token will be added by the auth context via a setter
    // This is a fallback - the proper way is to set it via setAuthToken
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401 with token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is not 401 or already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return API(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Call refresh endpoint (refresh token is in HTTP-only cookie)
      // Use the API instance which has withCredentials: true
      const response = await API.post("/auth/refresh", {})

      const { accessToken } = response.data?.data || {}
      isRefreshing = false

      if (!accessToken) {
        const err = new Error("Refresh response missing access token")
        processQueue(err, null)
        return Promise.reject(err)
      }

      setAuthToken(accessToken)
      processQueue(null, accessToken)

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return API(originalRequest)
    } catch (refreshError) {
      isRefreshing = false
      processQueue(refreshError as Error, null)
      return Promise.reject(refreshError)
    }
  }
)

// Helper to set access token for subsequent requests
export function setAuthToken(token: string | null) {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete API.defaults.headers.common["Authorization"]
  }
}

// Helper to get current auth token
export function getAuthToken(): string | undefined {
  const authHeader = API.defaults.headers.common["Authorization"]
  if (typeof authHeader === "string") {
    return authHeader.replace("Bearer ", "")
  }
  return undefined
}