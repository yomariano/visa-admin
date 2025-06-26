import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    console.log('📋 CLONE request received');
    
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    console.log('🔑 Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl?.substring(0, 30) + '...'
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing env vars');
      return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
    }

    const params = await context.params;
    const id = Number(params.id);
    console.log('📋 Clone ID:', id);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing row
    console.log('🔄 Fetching existing row...');
    const { data: existing, error: fetchError } = await supabase
      .from('permit_rules')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    console.log('📋 Original data:', existing);

    // Omit columns that should not be duplicated
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, updated_at: _updated, ...insertData } = existing as Record<string, unknown>;

    console.log('📋 Data to insert:', insertData);

    const { data: newRow, error: insertError } = await supabase
      .from('permit_rules')
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log('✅ Clone successful:', newRow);
    return NextResponse.json(newRow);
  } catch (catchError) {
    console.error('💥 Clone route exception:', catchError);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: catchError instanceof Error ? catchError.message : 'Unknown error'
    }, { status: 500 });
  }
} 