import { createClient } from '@supabase/supabase-js';

// Configuration - UPDATE THESE VALUES WITH YOUR ACTUAL SUPABASE CREDENTIALS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Allowed admin emails - UPDATE THIS LIST WITH YOUR TEAM'S EMAILS
export const ADMIN_EMAILS = [
  'your-email@gmail.com',
  'colleague1@gmail.com',
  'colleague2@gmail.com',
  // Add more emails as needed
];

// Check if user is admin
export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}; 