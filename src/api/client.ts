import axios, { AxiosError } from 'axios';

/**
 * Base API Gateway client.
 * Reads the gateway URL from VITE_API_GATEWAY_URL (set in .env).
 * The backend is a set of independently deployable microservices
 * fronted by a single API Gateway. This client talks only to the gateway.
 */
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopkart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors so the UI can show a single message
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  },
);

export const formatINR = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const API_GATEWAY = API_GATEWAY_URL;
