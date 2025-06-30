// API Client for visa-admin-api backend
// This replaces direct Supabase calls with HTTP requests to our secure API

import { PermitRule, RequiredDocument } from './types';

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-api.thecodejesters.xyz';

// Development environment detection
const isDevelopment = process.env.NODE_ENV === 'development';

// API Response Types
interface DiagnosticsResponse {
  server: {
    nodeEnv: string;
    port: number;
    isDevelopment: boolean;
    uptime: number;
    timestamp: string;
  };
  supabase: {
    url: string;
    hasAnonKey: boolean;
    hasServiceKey: boolean;
    urlType: string;
  };
  cors: {
    origins: string[];
  };
  tests: {
    basicConnection?: boolean;
    tableAccess?: {
      permitRules: boolean;
      requiredDocuments: boolean;
      permitRulesError: string | null;
      requiredDocumentsError: string | null;
    };
    error?: string;
  };
}

// Safe logging utility - only logs in development
const devLog = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log('🔌 API Client:', ...args);
  }
};

// Generic API error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request function with error handling
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  devLog(`Making ${options.method || 'GET'} request to:`, endpoint);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    devLog(`Response status: ${response.status} for ${endpoint}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new ApiError(errorMessage, response.status, endpoint);
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    devLog(`Successfully received data from ${endpoint}:`, data);
    
    return data;
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`💥 Network error for ${endpoint}:`, error);
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0,
      endpoint
    );
  }
}

// Permit Rules API functions
export const permitRulesApi = {
  // Get all permit rules
  async getAll(): Promise<PermitRule[]> {
    devLog('Fetching all permit rules');
    return apiRequest<PermitRule[]>('/api/permit-rules');
  },

  // Get permit rule by ID
  async getById(id: number): Promise<PermitRule> {
    devLog('Fetching permit rule by ID:', id);
    return apiRequest<PermitRule>(`/api/permit-rules/${id}`);
  },

  // Create new permit rule
  async create(data: Omit<PermitRule, 'id' | 'updated_at'>): Promise<PermitRule> {
    devLog('Creating new permit rule:', data);
    return apiRequest<PermitRule>('/api/permit-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update existing permit rule
  async update(id: number, data: Partial<PermitRule>): Promise<PermitRule> {
    devLog('Updating permit rule:', id, data);
    return apiRequest<PermitRule>(`/api/permit-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete permit rule
  async delete(id: number): Promise<void> {
    devLog('Deleting permit rule:', id);
    await apiRequest<void>(`/api/permit-rules/${id}`, {
      method: 'DELETE',
    });
  },
};

// Required Documents API functions
export const requiredDocumentsApi = {
  // Get all required documents
  async getAll(): Promise<RequiredDocument[]> {
    devLog('Fetching all required documents');
    return apiRequest<RequiredDocument[]>('/api/required-documents');
  },

  // Get required document by ID
  async getById(id: number): Promise<RequiredDocument> {
    devLog('Fetching required document by ID:', id);
    return apiRequest<RequiredDocument>(`/api/required-documents/${id}`);
  },

  // Create new required document
  async create(data: Omit<RequiredDocument, 'id' | 'updated_at'>): Promise<RequiredDocument> {
    devLog('Creating new required document:', data);
    return apiRequest<RequiredDocument>('/api/required-documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update existing required document
  async update(id: number, data: Partial<RequiredDocument>): Promise<RequiredDocument> {
    devLog('Updating required document:', id, data);
    return apiRequest<RequiredDocument>(`/api/required-documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete required document
  async delete(id: number): Promise<void> {
    devLog('Deleting required document:', id);
    await apiRequest<void>(`/api/required-documents/${id}`, {
      method: 'DELETE',
    });
  },
};

// Health check functions for monitoring
export const healthApi = {
  // Basic health check
  async check(): Promise<{ status: string; timestamp: string; service: string }> {
    return apiRequest('/health');
  },

  // Database health check
  async checkDatabase(): Promise<{
    status: string;
    database: string;
    services: Record<string, boolean>;
    allTestsPassed: boolean;
    timestamp: string;
  }> {
    return apiRequest('/health/db');
  },

  // Full diagnostics
  async diagnostics(): Promise<DiagnosticsResponse> {
    return apiRequest('/health/diagnostics');
  },
};

// Configuration info
export const apiConfig = {
  baseUrl: API_BASE_URL,
  isDevelopment,
}; 