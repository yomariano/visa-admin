import { createClient } from '@supabase/supabase-js';

// Configuration - UPDATE THESE VALUES WITH YOUR ACTUAL SUPABASE CREDENTIALS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔧 Supabase Client Configuration:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('Supabase URL:', supabaseUrl);

// Create Supabase client
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
console.log('✅ Supabase client created successfully');

// Export the client directly - we'll add logging in the database-actions.ts file instead
export const supabase = supabaseClient;

// Get admin emails from environment variable (comma-separated)
// Example: ADMIN_EMAILS=email1@gmail.com,email2@gmail.com,email3@gmail.com
const getAdminEmails = (): string[] => {
  console.log('🔍 Getting admin emails...');
  const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  
  console.log('ADMIN_EMAILS env var:', process.env.ADMIN_EMAILS ? '✅ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_ADMIN_EMAILS env var:', process.env.NEXT_PUBLIC_ADMIN_EMAILS ? '✅ Set' : '❌ Missing');
  console.log('Raw admin emails value:', adminEmailsEnv);
  
  if (!adminEmailsEnv) {
    console.warn('⚠️  No ADMIN_EMAILS environment variable found. Using fallback emails.');
    // Fallback emails - UPDATE THESE IF NOT USING ENVIRONMENT VARIABLES
    const fallbackEmails = [
      'your-email@gmail.com',
      'colleague1@gmail.com',
      'colleague2@gmail.com',
    ];
    console.log('📧 Using fallback emails:', fallbackEmails);
    return fallbackEmails;
  }
  
  const parsedEmails = adminEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
    
  console.log('📧 Parsed admin emails:', parsedEmails);
  return parsedEmails;
};

export const ADMIN_EMAILS = getAdminEmails();

// Check if user is admin
export const isAdminEmail = (email: string): boolean => {
  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  console.log(`🔐 Checking if ${email} is admin:`, isAdmin ? '✅ YES' : '❌ NO');
  console.log('📋 Available admin emails:', ADMIN_EMAILS);
  return isAdmin;
};

// Debug function to log admin emails (remove in production)
export const logAdminEmails = () => {
  console.log('🔐 Configured admin emails:', ADMIN_EMAILS);
}; 