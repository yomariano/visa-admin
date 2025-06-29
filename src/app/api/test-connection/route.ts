import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test environment variables
    console.log('Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('- SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'Set (length: ' + process.env.SUPABASE_SERVICE_KEY.length + ')' : 'Not set');
    
    // Test client creation
    console.log('Creating Supabase client...');
    const supabase = createServerSupabaseClient();
    console.log('✅ Supabase client created successfully');
    
    // Test simple query
    console.log('Testing database connection with simple query...');
    
    let data, error, result;
    try {
      result = await supabase
        .from('permit_rules')
        .select('count(*)', { count: 'exact', head: true });
      
      data = result.data;
      error = result.error;
      console.log('Query result:', { data, error, count: result.count });
    } catch (queryError) {
      console.error('💥 Query exception:', queryError);
      error = queryError;
      data = null;
    }
    
    if (error) {
      console.error('❌ Database query error:', error);
      return NextResponse.json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed',
        details: {
          message: error instanceof Error ? error.message : String(error),
          code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
          details: error && typeof error === 'object' && 'details' in error ? error.details : undefined,
          hint: error && typeof error === 'object' && 'hint' in error ? error.hint : undefined
        }
      }, { status: 500 });
    }
    
    console.log('✅ Database connection test successful');
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      environment: process.env.NODE_ENV,
      tableCount: result?.count || 0
    });
    
  } catch (error) {
    console.error('💥 Connection test failed:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
      details: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
} 