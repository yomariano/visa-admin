'use server';

import { PermitRule, RequiredDocument } from './types';
import { createServerSupabaseClient } from './supabase';

// Environment helper
const isDevelopment = process.env.NODE_ENV === 'development';

// Safe logging utility - only logs in development
const devLog = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

// Create secure server-side Supabase client
const getSupabaseClient = () => {
  try {
    return createServerSupabaseClient();
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    throw new Error('Database configuration error');
  }
};

// Permit Rules Actions
export async function getPermitRules(): Promise<PermitRule[]> {
  devLog('🔍 getPermitRules() called');
  
  let data, error;
  try {
    const supabase = getSupabaseClient();
    devLog('📡 Fetching permit rules from database...');
    
    const result = await supabase
      .from('permit_rules')
      .select('*')
      .order('id', { ascending: false });
    
    data = result.data;
    error = result.error;
  } catch (queryError) {
    console.error('💥 Query exception in getPermitRules:', queryError);
    error = queryError;
    data = null;
  }

  devLog('📊 Database response received');
  devLog('📈 Number of permit rules found:', data?.length || 0);

  if (error) {
    console.error('❌ Error fetching permit rules:', error);
    return [];
  }
  
  devLog('✅ Successfully fetched permit rules');
  return data || [];
}

export async function createPermitRule(data: Omit<PermitRule, 'id' | 'updated_at'>): Promise<PermitRule | null> {
  let result, error;
  try {
    const supabase = getSupabaseClient();
    const queryResult = await supabase
      .from('permit_rules')
      .insert([data])
      .select()
      .single();
    
    result = queryResult.data;
    error = queryResult.error;
  } catch (queryError) {
    console.error('💥 Query exception in createPermitRule:', queryError);
    error = queryError;
    result = null;
  }

  if (error) {
    console.error('❌ Error creating permit rule:', error);
    return null;
  }
  
  devLog('✅ Successfully created permit rule');
  return result;
}

export async function updatePermitRule(id: number, data: Partial<PermitRule>): Promise<PermitRule | null> {
  let result, error;
  try {
    const supabase = getSupabaseClient();
    const queryResult = await supabase
      .from('permit_rules')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    result = queryResult.data;
    error = queryResult.error;
  } catch (queryError) {
    console.error('💥 Query exception in updatePermitRule:', queryError);
    error = queryError;
    result = null;
  }

  if (error) {
    console.error('❌ Error updating permit rule:', error);
    return null;
  }
  
  devLog('✅ Successfully updated permit rule');
  return result;
}

export async function deletePermitRule(id: number): Promise<boolean> {
  let error;
  try {
    const supabase = getSupabaseClient();
    const result = await supabase
      .from('permit_rules')
      .delete()
      .eq('id', id);
    
    error = result.error;
  } catch (queryError) {
    console.error('💥 Query exception in deletePermitRule:', queryError);
    error = queryError;
  }

  if (error) {
    console.error('❌ Error deleting permit rule:', error);
    return false;
  }
  
  devLog('✅ Successfully deleted permit rule');
  return true;
}

// Required Documents Actions
export async function getRequiredDocuments(): Promise<RequiredDocument[]> {
  devLog('🔍 getRequiredDocuments() called');
  
  let data, error;
  try {
    const supabase = getSupabaseClient();
    devLog('📡 Fetching required documents from database...');
    
    const result = await supabase
      .from('required_documents')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: false });
    
    data = result.data;
    error = result.error;
  } catch (queryError) {
    console.error('💥 Query exception in getRequiredDocuments:', queryError);
    error = queryError;
    data = null;
  }

  devLog('📊 Database response received');
  devLog('📈 Number of required documents found:', data?.length || 0);

  if (error) {
    console.error('❌ Error fetching required documents:', error);
    return [];
  }
  
  devLog('✅ Successfully fetched required documents');
  return data || [];
}

export async function createRequiredDocument(data: Omit<RequiredDocument, 'id' | 'updated_at'>): Promise<RequiredDocument | null> {
  let result, error;
  try {
    const supabase = getSupabaseClient();
    const queryResult = await supabase
      .from('required_documents')
      .insert([data])
      .select()
      .single();
    
    result = queryResult.data;
    error = queryResult.error;
  } catch (queryError) {
    console.error('💥 Query exception in createRequiredDocument:', queryError);
    error = queryError;
    result = null;
  }

  if (error) {
    console.error('❌ Error creating required document:', error);
    return null;
  }
  
  devLog('✅ Successfully created required document');
  return result;
}

export async function updateRequiredDocument(id: number, data: Partial<RequiredDocument>): Promise<RequiredDocument | null> {
  let result, error;
  try {
    const supabase = getSupabaseClient();
    const queryResult = await supabase
      .from('required_documents')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    result = queryResult.data;
    error = queryResult.error;
  } catch (queryError) {
    console.error('💥 Query exception in updateRequiredDocument:', queryError);
    error = queryError;
    result = null;
  }

  if (error) {
    console.error('❌ Error updating required document:', error);
    return null;
  }
  
  devLog('✅ Successfully updated required document');
  return result;
}

export async function deleteRequiredDocument(id: number): Promise<boolean> {
  let error;
  try {
    const supabase = getSupabaseClient();
    const result = await supabase
      .from('required_documents')
      .delete()
      .eq('id', id);
    
    error = result.error;
  } catch (queryError) {
    console.error('💥 Query exception in deleteRequiredDocument:', queryError);
    error = queryError;
  }

  if (error) {
    console.error('❌ Error deleting required document:', error);
    return false;
  }
  
  devLog('✅ Successfully deleted required document');
  return true;
} 