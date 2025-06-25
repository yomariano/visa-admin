import { createClient } from '@supabase/supabase-js';

// Configuration - UPDATE THESE VALUES WITH YOUR ACTUAL SUPABASE CREDENTIALS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get admin emails from environment variable (comma-separated)
// Example: ADMIN_EMAILS=email1@gmail.com,email2@gmail.com,email3@gmail.com
const getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  
  if (!adminEmailsEnv) {
    console.warn('⚠️  No ADMIN_EMAILS environment variable found. Using fallback emails.');
    // Fallback emails - UPDATE THESE IF NOT USING ENVIRONMENT VARIABLES
    return [
      'your-email@gmail.com',
      'colleague1@gmail.com',
      'colleague2@gmail.com',
    ];
  }
  
  return adminEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
};

export const ADMIN_EMAILS = getAdminEmails();

// Check if user is admin
export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Debug function to log admin emails (remove in production)
export const logAdminEmails = () => {
  console.log('🔐 Configured admin emails:', ADMIN_EMAILS);
}; 