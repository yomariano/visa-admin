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
  devLog('🔍 API: getPermitRules() called');
  
  try {
    const supabase = createServerSupabaseClient();
    devLog('✅ Supabase client created');
    
    devLog('📡 Fetching permit rules from database...');
    
    let data, error;
    try {
      const result = await supabase
        .from('permit_rules')
        .select('*')
        .order('id', { ascending: false });
      
      data = result.data;
      error = result.error;
    } catch (queryError) {
      console.error('💥 Query exception:', queryError);
      error = queryError;
      data = null;
    }

    devLog('📊 Database response received');
    devLog('📈 Number of permit rules found:', data?.length || 0);

    if (error) {
      console.error('❌ Error fetching permit rules:', error);
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Database error' 
      }, { status: 500 });
    }
    
    devLog('✅ Successfully fetched permit rules');
    return NextResponse.json(data || []);
    
  } catch (error) {
    console.error('💥 Exception in getPermitRules:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  devLog('📝 API: createPermitRule() called');

  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();

    let data, error;
    try {
      const result = await supabase
        .from('permit_rules')
        .insert([body])
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } catch (queryError) {
      console.error('💥 Query exception:', queryError);
      error = queryError;
      data = null;
    }

    if (error) {
      console.error('❌ Error creating permit rule:', error);
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Database error' 
      }, { status: 500 });
    }

    devLog('✅ Successfully created permit rule');
    return NextResponse.json(data);

  } catch (error) {
    console.error('💥 Exception in createPermitRule:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
} 