'use server';

import { PermitRule, RequiredDocument } from './types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔧 Database Actions Debug Info:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required Supabase environment variables');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('✅ Supabase client created successfully');

// Permit Rules Actions
export async function getPermitRules(): Promise<PermitRule[]> {
  console.log('🔍 getPermitRules() called');
  try {
    console.log('📡 Fetching permit rules from database...');
    const { data, error } = await supabase
      .from('permit_rules')
      .select('*')
      .order('id', { ascending: false });

    console.log('📊 Database response:', { data, error });
    console.log('📈 Number of permit rules found:', data?.length || 0);

    if (error) {
      console.error('❌ Error fetching permit rules:', error);
      throw error;
    }
    
    console.log('✅ Successfully fetched permit rules');
    return data || [];
  } catch (error) {
    console.error('💥 Exception in getPermitRules:', error);
    return [];
  }
}

export async function createPermitRule(data: Omit<PermitRule, 'id' | 'updated_at'>): Promise<PermitRule | null> {
  try {
    const { data: newRule, error } = await supabase
      .from('permit_rules')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return newRule;
  } catch (error) {
    console.error('Error creating permit rule:', error);
    return null;
  }
}

export async function updatePermitRule(id: number, data: Partial<Omit<PermitRule, 'id' | 'updated_at'>>): Promise<PermitRule | null> {
  try {
    const { data: updatedRule, error } = await supabase
      .from('permit_rules')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedRule;
  } catch (error) {
    console.error('Error updating permit rule:', error);
    return null;
  }
}

export async function deletePermitRule(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('permit_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting permit rule:', error);
    return false;
  }
}

// Required Documents Actions
export async function getRequiredDocuments(): Promise<RequiredDocument[]> {
  console.log('🔍 getRequiredDocuments() called');
  try {
    console.log('📡 Fetching required documents from database...');
    const { data, error } = await supabase
      .from('required_documents')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: false });

    console.log('📊 Database response:', { data, error });
    console.log('📈 Number of required documents found:', data?.length || 0);

    if (error) {
      console.error('❌ Error fetching required documents:', error);
      throw error;
    }
    
    console.log('✅ Successfully fetched required documents');
    return data || [];
  } catch (error) {
    console.error('💥 Exception in getRequiredDocuments:', error);
    return [];
  }
}

export async function createRequiredDocument(data: Omit<RequiredDocument, 'id' | 'updated_at'>): Promise<RequiredDocument | null> {
  try {
    const { data: newDoc, error } = await supabase
      .from('required_documents')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return newDoc;
  } catch (error) {
    console.error('Error creating required document:', error);
    return null;
  }
}

export async function updateRequiredDocument(id: number, data: Partial<Omit<RequiredDocument, 'id' | 'updated_at'>>): Promise<RequiredDocument | null> {
  try {
    const { data: updatedDoc, error } = await supabase
      .from('required_documents')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedDoc;
  } catch (error) {
    console.error('Error updating required document:', error);
    return null;
  }
}

export async function deleteRequiredDocument(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('required_documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting required document:', error);
    return false;
  }
} 