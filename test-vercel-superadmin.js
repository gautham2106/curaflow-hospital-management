#!/usr/bin/env node

/**
 * VERCEL SUPERADMIN TEST
 * 
 * Tests the superadmin authentication on your Vercel deployment
 */

const SUPABASE_URL = "https://fgmljvcczanglzattxrs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbWxqdmNjemFuZ2x6YXR0eHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzU4ODIsImV4cCI6MjA3NjcxMTg4Mn0.UoPEDrm64mBjfQI3CzsPrjVtpHJxoVb8K1hSbyp6Tsg";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbWxqdmNjemFuZ2x6YXR0eHJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTEzNTg4MiwiZXhwIjoyMDc2NzExODgyfQ.VjNwP2UknvSdVUkivPJYLP3S5X0qw7YcnFjH95DEjv8";

async function testVercelDeployment() {
  console.log('🔍 TESTING VERCEL SUPERADMIN DEPLOYMENT\n');
  
  // Replace with your actual Vercel URL
  const VERCEL_URL = 'https://your-app-name.vercel.app'; // UPDATE THIS
  
  console.log('📝 IMPORTANT: Update the VERCEL_URL variable with your actual Vercel deployment URL');
  console.log('   Example: https://curaflow-hospital-management.vercel.app');
  console.log('');
  
  try {
    // Test 1: Direct Supabase database test
    console.log('1️⃣ Testing Supabase database connection...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { data, error } = await supabase.rpc('authenticate_superadmin', {
      p_username: 'superadmin',
      p_password: 'superadmin123'
    });
    
    if (error) {
      console.log('   ❌ Database authentication failed:', error.message);
      console.log('   🔧 Solution: Run FIX-SUPERADMIN-AUTH.sql in Supabase SQL Editor');
      return;
    }
    
    if (data && data.length > 0 && data[0].is_authenticated) {
      console.log('   ✅ Database authentication successful');
      console.log('   🎫 Token generated:', data[0].token ? 'Yes' : 'No');
    } else {
      console.log('   ❌ Database authentication failed: Invalid credentials');
      return;
    }
    
    // Test 2: Vercel API test (if URL is provided)
    if (VERCEL_URL !== 'https://your-app-name.vercel.app') {
      console.log('\n2️⃣ Testing Vercel API endpoint...');
      
      const response = await fetch(`${VERCEL_URL}/api/superadmin/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'superadmin',
          password: 'superadmin123'
        })
      });
      
      console.log('   📊 Response status:', response.status);
      
      const responseText = await response.text();
      console.log('   📊 Response body:', responseText);
      
      if (response.ok) {
        console.log('   ✅ Vercel API authentication successful!');
      } else {
        console.log('   ❌ Vercel API authentication failed');
      }
    } else {
      console.log('\n2️⃣ Skipping Vercel API test (URL not configured)');
    }
    
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 NEXT STEPS:');
  console.log('1. Update VERCEL_URL in this script with your actual deployment URL');
  console.log('2. Run: node test-vercel-superadmin.js');
  console.log('3. Or test manually at: https://your-app.vercel.app/superadmin/dashboard');
  console.log('4. Use credentials: superadmin / superadmin123');
  console.log('='.repeat(60));
}

// Run test
testVercelDeployment().catch(error => {
  console.error('💥 Test failed:', error);
});
