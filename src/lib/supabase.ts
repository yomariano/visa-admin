import { createClient } from '@supabase/supabase-js';

// Environment helper
const isDevelopment = process.env.NODE_ENV === 'development';

// Safe logging utility - only logs in development
const devLog = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

// CLIENT-SIDE Configuration (safe for browser)
// Only the URL and anon key should be exposed client-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// SERVER-SIDE Configuration (never exposed to browser)
// These are only available in server-side code (API routes, server actions)
const getServerConfig = () => {
  // Only access server-side env vars in server context
  if (typeof window !== 'undefined') {
    throw new Error('Server configuration accessed on client side');
  }
  
  return {
    supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    adminEmails: process.env.ADMIN_EMAILS
  };
};

// Development bypass configuration (only for local development)
const devBypassAuth = isDevelopment && process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';
const devUserEmail = process.env.NEXT_PUBLIC_DEV_USER_EMAIL || 'dev@localhost.com';

// Safe configuration logging (only in development, no sensitive data)
if (isDevelopment) {
  devLog('🔧 Supabase Client Configuration:');
  devLog('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  devLog('ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  devLog('DEV_BYPASS_AUTH:', devBypassAuth ? '✅ Enabled' : '❌ Disabled');
  devLog('Environment:', process.env.NODE_ENV);
}

// Create standard client for browser use
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Development client (only for local development with bypass auth)
let devSupabaseClient: ReturnType<typeof createClient> | null = null;

if (devBypassAuth && isDevelopment) {
  // In development, we can access the service key via NEXT_PUBLIC_ for convenience
  // This should NEVER be used in production
  const devServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
  
  if (devServiceKey) {
    devLog('🚧 DEV MODE: Creating service role client to bypass RLS');
    devSupabaseClient = createClient(supabaseUrl, devServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } else {
    devLog('⚠️ DEV MODE: No service key found, will use anon client');
  }
}

devLog('✅ Supabase client created successfully');

// Export the appropriate client based on development mode
export const supabase = devBypassAuth && devSupabaseClient ? devSupabaseClient : supabaseClient;

// Always export the regular client for auth operations
export const authSupabase = supabaseClient;

// SERVER-SIDE ONLY: Create admin client for server operations
export const createServerSupabaseClient = () => {
  const config = getServerConfig();
  
  if (!config.supabaseServiceKey) {
    throw new Error('Service key not available for server operations');
  }
  
  return createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Get admin emails (works both server-side and client-side)
const getAdminEmails = (): string[] => {
  let adminEmailsEnv: string | undefined;
  
  // Try to get from server-side first, then fallback to client-side
  if (typeof window === 'undefined') {
    // Server-side - use secure variable
    adminEmailsEnv = process.env.ADMIN_EMAILS;
  } else {
    // Client-side - try public variable (needed for auth checks)
    adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
    
    // If no public admin emails and in development, try the dev variable
    if (!adminEmailsEnv && isDevelopment) {
      devLog('⚠️ Using fallback admin emails for development');
    }
  }
  
  if (isDevelopment) {
    devLog('🔍 Getting admin emails...');
    devLog('Admin emails available:', adminEmailsEnv ? '✅ Set' : '❌ Missing');
    devLog('Running on:', typeof window === 'undefined' ? 'Server' : 'Client');
  }
  
  if (!adminEmailsEnv) {
    if (isDevelopment) {
      devLog('⚠️ No ADMIN_EMAILS environment variable found. Using fallback emails.');
      // Fallback emails for development
      const fallbackEmails = [
        'your-email@gmail.com',
        'colleague1@gmail.com',
        'colleague2@gmail.com',
        'dev@localhost.com',
      ];
      devLog('📧 Using fallback emails (development only)');
      return fallbackEmails;
    } else {
      // In production, if no admin emails are configured, log error and return empty
      console.error('❌ ADMIN_EMAILS not configured properly in production');
      console.error('💡 Make sure to set NEXT_PUBLIC_ADMIN_EMAILS for client-side auth checks');
      return [];
    }
  }
  
  const parsedEmails = adminEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
    
  // Add dev email in development bypass mode
  if (devBypassAuth && !parsedEmails.includes(devUserEmail.toLowerCase())) {
    parsedEmails.push(devUserEmail.toLowerCase());
    devLog(`🚧 DEV MODE: Added ${devUserEmail} to admin emails`);
  }
    
  if (isDevelopment) {
    devLog('📧 Parsed admin emails count:', parsedEmails.length);
  }
  
  return parsedEmails;
};

export const ADMIN_EMAILS = getAdminEmails();

// Check if user is admin
export const isAdminEmail = (email: string): boolean => {
  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  
  if (isDevelopment) {
    devLog(`🔐 Checking if ${email} is admin:`, isAdmin ? '✅ YES' : '❌ NO');
  }
  
  return isAdmin;
};

// Development utility (only works in development)
export const logAdminEmails = () => {
  if (isDevelopment) {
    devLog('🔐 Configured admin emails count:', ADMIN_EMAILS.length);
  }
}; 