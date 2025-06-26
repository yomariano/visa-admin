import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
    }

    const params = await context.params;
    const id = Number(params.id);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing row
    const { data: existing, error: fetchError } = await supabase
      .from('permit_rules')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Omit columns that should not be duplicated
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, updated_at: _updated, ...insertData } = existing as Record<string, unknown>;

    const { data: newRow, error: insertError } = await supabase
      .from('permit_rules')
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(newRow);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 