import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    console.log('🔄 PUT request received');
    
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    console.log('🔑 Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl?.substring(0, 30) + '...'
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables');
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    const params = await context.params;
    const id = Number(params.id);
    const body = await request.json();

    console.log('📝 Update data:', { id, body });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🔄 Attempting Supabase update...');
    const { data, error } = await supabase
      .from('permit_rules')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Update successful:', data);
    return NextResponse.json(data);
  } catch (catchError) {
    console.error('💥 Route exception:', catchError);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: catchError instanceof Error ? catchError.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    console.log('🗑️ DELETE request received');
    
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables');
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    const params = await context.params;
    const id = Number(params.id);

    console.log('🗑️ Delete ID:', id);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabase
      .from('permit_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Delete successful');
    return NextResponse.json({ success: true });
  } catch (catchError) {
    console.error('💥 Delete route exception:', catchError);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: catchError instanceof Error ? catchError.message : 'Unknown error'
    }, { status: 500 });
  }
} 