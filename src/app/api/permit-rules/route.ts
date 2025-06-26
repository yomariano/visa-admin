import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  console.log('🔍 API: getPermitRules() called');
  
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
    
    console.log('📡 Fetching permit rules from database...');
    const { data, error } = await supabase
      .from('permit_rules')
      .select('*')
      .order('id', { ascending: false });

    console.log('📊 Database response:', { data, error });
    console.log('📈 Number of permit rules found:', data?.length || 0);

    if (error) {
      console.error('❌ Error fetching permit rules:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ Successfully fetched permit rules');
    return NextResponse.json(data || []);
    
  } catch (error) {
    console.error('💥 Exception in getPermitRules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('📝 API: createPermitRule() called');

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase env vars');
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    const body = await request.json();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('permit_rules')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting permit rule:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Permit rule created:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('💥 Exception in createPermitRule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 