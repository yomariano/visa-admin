import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env_check: {
      has_supabase_url: !!process.env.SUPABASE_URL,
      has_next_public_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_supabase_service_key: !!process.env.SUPABASE_SERVICE_KEY,
      has_next_public_supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabase_url_preview: process.env.SUPABASE_URL?.substring(0, 50) || 'not set',
      public_supabase_url_preview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) || 'not set'
    }
  });
} 