import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    const params = await context.params;
    const id = Number(params.id);
    const body = await request.json();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('permit_rules')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    const params = await context.params;
    const id = Number(params.id);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabase
      .from('permit_rules')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 