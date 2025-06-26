import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  console.log('🔧 Testing database connection...');
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    console.log('Environment check:');
    console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client created');
    
    // Test connection with a simple query
    console.log('📡 Testing database connection...');
    const { data, error, count } = await supabase
      .from('required_documents')
      .select('*', { count: 'exact' })
      .limit(1);
    
    console.log('Database response:', { data, error, count });
    
    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      recordCount: count,
      sampleData: data,
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