import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    ADMIN_EMAILS: process.env.ADMIN_EMAILS ? '✅ Set' : '❌ Missing',
  };

  console.log('🔧 Environment Variables Check:', envCheck);

  return NextResponse.json({
    message: 'Environment Variables Check',
    env: envCheck,
    timestamp: new Date().toISOString()
  });
} 