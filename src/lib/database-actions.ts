// Client-side database actions using API client
// This avoids server-side network connectivity issues

import { PermitRule, RequiredDocument } from './types';
import { permitRulesApi, requiredDocumentsApi, ApiError } from './api-client';

// Environment helper
const isDevelopment = process.env.NODE_ENV === 'development';

// Safe logging utility - only logs in development
const devLog = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log('🎯 Database Actions:', ...args);
  }
};

// Log API configuration on module load
if (isDevelopment) {
  console.log('🎯 Database Actions Module Loaded:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - API_URL (server):', process.env.API_URL || 'not set');
  console.log('  - NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'not set');
  console.log('  - Running on:', typeof window === 'undefined' ? 'Server' : 'Client');
}

// Error handling helper for API calls
const handleApiError = (error: unknown, operation: string) => {
  if (error instanceof ApiError) {
    console.error(`❌ API Error in ${operation}:`, {
      message: error.message,
      status: error.status,
      endpoint: error.endpoint
    });
  } else {
    console.error(`💥 Unexpected error in ${operation}:`, error);
  }
};

// Permit Rules Actions
export async function getPermitRules(): Promise<PermitRule[]> {
  devLog('🔍 getPermitRules() called');
  
  try {
    devLog('📡 Fetching permit rules from API...');
    const data = await permitRulesApi.getAll();
    
    devLog('📊 API response received');
    devLog('📈 Number of permit rules found:', data?.length || 0);
    
    devLog('✅ Successfully fetched permit rules');
    return data || [];
    
  } catch (error) {
    handleApiError(error, 'getPermitRules');
    return [];
  }
}

export async function createPermitRule(data: Omit<PermitRule, 'id' | 'updated_at'>): Promise<PermitRule | null> {
  devLog('➕ createPermitRule() called');
  
  try {
    const result = await permitRulesApi.create(data);
    devLog('✅ Successfully created permit rule');
    return result;
    
  } catch (error) {
    handleApiError(error, 'createPermitRule');
    return null;
  }
}

export async function updatePermitRule(id: number, data: Partial<PermitRule>): Promise<PermitRule | null> {
  devLog('🔄 updatePermitRule() called for ID:', id);
  
  try {
    const result = await permitRulesApi.update(id, data);
    devLog('✅ Successfully updated permit rule');
    return result;
    
  } catch (error) {
    handleApiError(error, 'updatePermitRule');
    return null;
  }
}

export async function deletePermitRule(id: number): Promise<boolean> {
  devLog('🗑️ deletePermitRule() called for ID:', id);
  
  try {
    await permitRulesApi.delete(id);
    devLog('✅ Successfully deleted permit rule');
    return true;
    
  } catch (error) {
    handleApiError(error, 'deletePermitRule');
    return false;
  }
}

// Required Documents Actions
export async function getRequiredDocuments(): Promise<RequiredDocument[]> {
  devLog('🔍 getRequiredDocuments() called');
  
  try {
    devLog('📡 Fetching required documents from API...');
    const data = await requiredDocumentsApi.getAll();
    
    devLog('📊 API response received');
    devLog('📈 Number of required documents found:', data?.length || 0);
    
    devLog('✅ Successfully fetched required documents');
    return data || [];
    
  } catch (error) {
    handleApiError(error, 'getRequiredDocuments');
    return [];
  }
}

export async function createRequiredDocument(data: Omit<RequiredDocument, 'id' | 'updated_at'>): Promise<RequiredDocument | null> {
  devLog('➕ createRequiredDocument() called');
  
  try {
    const result = await requiredDocumentsApi.create(data);
    devLog('✅ Successfully created required document');
    return result;
    
  } catch (error) {
    handleApiError(error, 'createRequiredDocument');
    return null;
  }
}

export async function updateRequiredDocument(id: number, data: Partial<RequiredDocument>): Promise<RequiredDocument | null> {
  devLog('🔄 updateRequiredDocument() called for ID:', id);
  
  try {
    const result = await requiredDocumentsApi.update(id, data);
    devLog('✅ Successfully updated required document');
    return result;
    
  } catch (error) {
    handleApiError(error, 'updateRequiredDocument');
    return null;
  }
}

export async function deleteRequiredDocument(id: number): Promise<boolean> {
  devLog('🗑️ deleteRequiredDocument() called for ID:', id);
  
  try {
    await requiredDocumentsApi.delete(id);
    devLog('✅ Successfully deleted required document');
    return true;
    
  } catch (error) {
    handleApiError(error, 'deleteRequiredDocument');
    return false;
  }
} 