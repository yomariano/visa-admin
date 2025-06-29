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
  devLog('🔧 Testing database connection...');
  
  try {
    const supabase = createServerSupabaseClient();
    devLog('✅ Supabase client created');
    
    // Test connection with a simple query
    devLog('📡 Testing database connection...');
    
    let data, error, count;
    try {
      const result = await supabase
        .from('required_documents')
        .select('*', { count: 'exact' })
        .limit(1);
      
      data = result.data;
      error = result.error;
      count = result.count;
    } catch (queryError) {
      console.error('💥 Query exception:', queryError);
      error = queryError;
      data = null;
      count = null;
    }
    
    devLog('Database response received');
    
    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error',
        details: isDevelopment ? error : undefined
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      recordCount: count,
      sampleDataCount: data?.length || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Exception in database test:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 