#!/usr/bin/env node

// Test script to verify server-side API calls work
// This simulates the server environment of Next.js

console.log('🧪 Testing Server-side API Configuration');
console.log('========================================');

// Load environment variables using dynamic import
async function loadEnv() {
  try {
    const { config } = await import('dotenv');
    config({ path: '.env.local' });
  } catch {
    console.log('Note: dotenv not available, using system env vars');
  }
}

async function main() {
  await loadEnv();

  console.log('Environment Variables:');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  API_URL:', process.env.API_URL || 'not set');
  console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'not set');

  // Simulate server environment
  const isServer = typeof window === 'undefined';
  console.log('\nEnvironment Check:');
  console.log('  typeof window:', typeof window);
  console.log('  isServer:', isServer);

  // Test API URL resolution
  const API_BASE_URL = isServer 
    ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://admin-api.thecodejesters.xyz')
    : (process.env.NEXT_PUBLIC_API_URL || 'https://admin-api.thecodejesters.xyz');

  console.log('\nAPI Configuration:');
  console.log('  Resolved API_BASE_URL:', API_BASE_URL);

  // Test actual API call
  console.log('\n🔍 Testing API Call...');
  
  const url = `${API_BASE_URL}/health`;
  console.log('  URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('  Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('  Response:', data);
      console.log('✅ API call successful!');
    } else {
      console.log('❌ API call failed with status:', response.status);
    }
  } catch (error) {
    console.error('💥 API call error:', error.message);
  }
}

// Run the test
main().catch(console.error); 