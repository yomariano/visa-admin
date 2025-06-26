import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  console.log('🔍 API: getRequiredDocuments() called');
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    console.log('🔧 Environment check:');
    console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing required Supabase environment variables');
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client created');
    
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ Successfully fetched required documents');
    return NextResponse.json(data || []);
    
  } catch (error) {
    console.error('💥 Exception in getRequiredDocuments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 