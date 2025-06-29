import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// Environment helper
const isDevelopment = process.env.NODE_ENV === 'development';

// Safe logging utility - only logs in development
const devLog = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

export async function GET() {
  devLog('🔍 API: getRequiredDocuments() called');
  
  try {
    const supabase = createServerSupabaseClient();
    devLog('✅ Supabase client created');
    
    devLog('📡 Fetching required documents from database...');
    
    let data, error;
    try {
      const result = await supabase
        .from('required_documents')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: false });
      
      data = result.data;
      error = result.error;
    } catch (queryError) {
      console.error('💥 Query exception:', queryError);
      error = queryError;
      data = null;
    }

    devLog('📊 Database response received');
    devLog('📈 Number of required documents found:', data?.length || 0);

    if (error) {
      console.error('❌ Error fetching required documents:', error);
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Database error' 
      }, { status: 500 });
    }
    
    devLog('✅ Successfully fetched required documents');
    return NextResponse.json(data || []);
    
  } catch (error) {
    console.error('💥 Exception in getRequiredDocuments:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
} 