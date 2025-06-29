import { NextResponse } from 'next/server';

// Environment helper
const isDevelopment = process.env.NODE_ENV === 'development';

export async function GET() {
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    // Server-side variables (secure)
    SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing',
    ADMIN_EMAILS: process.env.ADMIN_EMAILS ? '✅ Set' : '❌ Missing',
    // Client-side variables (safe to check)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    // Development variables (only show in development)
    ...(isDevelopment && {
      NEXT_PUBLIC_DEV_BYPASS_AUTH: process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_DEV_USER_EMAIL: process.env.NEXT_PUBLIC_DEV_USER_EMAIL ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_SERVICE_KEY: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ? '⚠️ Set (dev only)' : '❌ Missing',
    })
  };

  if (isDevelopment) {
    console.log('🔧 Environment Variables Check:', envCheck);
  }

  return NextResponse.json({
    message: 'Environment Variables Check',
    env: envCheck,
    timestamp: new Date().toISOString(),
    warnings: [
      ...(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY && !isDevelopment 
        ? ['⚠️ Service key exposed in production! This is a security risk.'] 
        : []),
      ...(process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true' && !isDevelopment 
        ? ['⚠️ Dev bypass auth enabled in production! This is a security risk.'] 
        : [])
    ]
  });
} 