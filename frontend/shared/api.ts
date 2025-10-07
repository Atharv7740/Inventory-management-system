/**
 * API Client Configuration for TransportPro Backend
 * Base URL: https://inventory-management-system-mzk7.onrender.com
 */

// Base API URL
// Priority order:
// 1. Vite environment variable VITE_API_BASE_URL (set in Vercel or local .env)
// 2. When building for production, fallback to the deployed backend on Render
// 3. Otherwise default to localhost for local development
const DEFAULT_BACKEND = 'https://inventory-management-system-mzk7.onrender.com';
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || (import.meta.env.PROD ? DEFAULT_BACKEND : 'http://localhost:5000');

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/profile',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password'
  },
  // User management endpoints
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    GET: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
    RESET_PASSWORD: (id: string) => `/api/users/${id}/reset-password`,
    TOGGLE_STATUS: (id: string) => `/api/users/${id}/toggle-status`
  },
  // Dashboard endpoints
  DASHBOARD: {
    OVERVIEW: '/api/dashboard/overview',
    RECENT_TRIPS: '/api/dashboard/recent-trips',
    FLEET_STATUS: '/api/dashboard/fleet-status',
    TRIPS: '/api/dashboard/trips',
    TRUCKS: '/api/dashboard/trucks'
  },
  // Trips endpoints
  TRIPS: {
    LIST: '/api/trips',
    CREATE: '/api/trips',
    GET: (id: string) => `/api/trips/${id}`,
    UPDATE: (id: string) => `/api/trips/${id}`,
    DELETE: (id: string) => `/api/trips/${id}`,
    STATS: '/api/trips/stats',
    RECENT: '/api/trips/recent',
    CALCULATE_PROFIT: '/api/trips/calculate-profit'
  },
  // Trucks endpoints
  TRUCKS: {
    LIST: '/api/trucks',
    CREATE: '/api/trucks',
    GET: (id: string) => `/api/trucks/${id}`,
    UPDATE: (id: string) => `/api/trucks/${id}`,
    DELETE: (id: string) => `/api/trucks/${id}`,
    STATS: '/api/trucks/stats',
    FLEET_STATUS: '/api/trucks/fleet-status',
    AVAILABLE: '/api/trucks/available',
    UPDATE_STATUS: (id: string) => `/api/trucks/${id}/status`,
    CALCULATE_PROFIT: '/api/trucks/calculate-profit'
  },
  // Reports endpoints
  REPORTS: {
    OVERVIEW: '/api/reports/overview',
    TRANSPORT: '/api/reports/transport',
    INVENTORY: '/api/reports/inventory'
  }
};

// Types
export type UserRole = 'admin' | 'staff';
export type UserStatus = 'active' | 'inactive';
export type TripStatus = 'completed' | 'in-transit' | 'pending' | 'cancelled';
export type TruckStatus = 'available' | 'in-transit' | 'maintenance' | 'sold';
export type PaymentMethod = 'cash' | 'RTGS' | 'cheque' | 'UPI' | 'other';

export interface User {
  _id?: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  department?: string;
  role: UserRole;
  status: UserStatus;
  permissions: UserPermissions;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  department?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  permissions: UserPermissions;
}

// Helper function to create default permissions based on role
export function createDefaultPermissions(role: UserRole): UserPermissions {
  const basePermissions: UserPermissions = {
    transportation: {
      viewTrips: false,
      editTrips: false,
      createTrips: false,
      deleteTrips: false
    },
    inventory: {
      viewInventory: false,
      editTrucks: false,
      addTrucks: false,
      deleteTrucks: false
    },
    reports: {
      viewReports: false,
      exportReports: false
    },
    userManagement: {
      viewUsers: false,
      editUsers: false,
      createUsers: false,
      deleteUsers: false
    }
  };

  if (role === 'admin') {
    // Admin gets all permissions
    return {
      transportation: {
        viewTrips: true,
        editTrips: true,
        createTrips: true,
        deleteTrips: true
      },
      inventory: {
        viewInventory: true,
        editTrucks: true,
        addTrucks: true,
        deleteTrucks: true
      },
      reports: {
        viewReports: true,
        exportReports: true
      },
      userManagement: {
        viewUsers: true,
        editUsers: true,
        createUsers: true,
        deleteUsers: true
      }
    };
  } else {
    // Staff gets basic permissions
    return {
      transportation: {
        viewTrips: true,
        editTrips: true,
        createTrips: true,
        deleteTrips: false
      },
      inventory: {
        viewInventory: true,
        editTrucks: false,
        addTrucks: false,
        deleteTrucks: false
      },
      reports: {
        viewReports: true,
        exportReports: false
      },
      userManagement: {
        viewUsers: false,
        editUsers: false,
        createUsers: false,
        deleteUsers: false
      }
    };
  }
}

export interface UserPermissions {
  transportation: {
    viewTrips: boolean;
    editTrips: boolean;
    createTrips: boolean;
    deleteTrips: boolean;
  };
  inventory: {
    viewInventory: boolean;
    editTrucks: boolean;
    addTrucks: boolean;
    deleteTrucks: boolean;
  };
  reports: {
    viewReports: boolean;
    exportReports: boolean;
  };
  userManagement: {
    viewUsers: boolean;
    editUsers: boolean;
    createUsers: boolean;
    deleteUsers: boolean;
  };
}

export interface Trip {
  _id?: string;
  tripId?: string;
  source: string;
  destination: string;
  goods: string;
  vehicleId: string;
  distance: number;
  startDate: string;
  returnDate: string;
  expenses: {
    diesel: number;
    driver: number;
    tolls: number;
    tyre: number;
    misc: number;
  };
  customerPayment: number;
  netProfit?: number;
  status: TripStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Truck {
  _id?: string;
  truckId?: string;
  registrationNumber: string;
  model: string;
  modelYear: number;
  seller: {
    name: string;
    contact: string;
    address: string;
    aadhaarNumber: string;
    email: string;
  };
  purchaseDate: string;
  purchasePrice: number;
  purchasePayments: Array<{
    method: PaymentMethod;
    amount: number;
    date: string;
  }>;
  documents: {
    NOC: boolean;
    insurance: boolean;
    fitness: boolean;
    tax: boolean;
  };
  expenses: {
    transportation: number;
    tollCharges: number;
    tyreCharges: number;
    fattaExpenses: number;
    driverCharges: number;
    bodyWork: number;
    paintExpenses: number;
    builtlyExpenses: number;
    diesel: number;
    kamaniWork: number;
    floorExpenses: number;
    insuranceExpenses: number;
    tyres: number;
    painting: number;
    misc: number;
  };
  sale?: {
    buyer: {
      name: string;
      contact: string;
      address: string;
      aadhaarNumber: string;
      email: string;
    };
    date: string;
    price: number;
    commission: number;
    commissionDealerName: string;
    payments: Array<{
      method: PaymentMethod;
      amount: number;
      date: string;
    }>;
  };
  resaleProfit?: number;
  status: TruckStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// API Client Class
export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    // Ensure base URL is properly formatted (no trailing slash)
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // Validate URL format
    try {
      new URL(this.baseUrl);
    } catch (error) {
      throw new Error(`Invalid API base URL: ${baseUrl}`);
    }
    
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
    
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Normalize the endpoint to ensure it starts with a single slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Construct the final URL, ensuring no double slashes
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    if (this.token) {
      // use bracket notation to satisfy HeadersInit typing
      (headers as any)['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      cache: 'no-cache',
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check if the backend is running and accessible.');
      }
      
      if (error.message.includes('CORS')) {
        throw new Error('CORS error: The server is not allowing requests from this origin. Please check the server CORS configuration.');
      }
      
      throw error;
    }
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Default API client instance
export const apiClient = new ApiClient();
