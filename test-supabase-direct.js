#!/usr/bin/env node

/**
 * DIRECT SUPABASE DATABASE TEST
 * 
 * Tests the superadmin authentication functions directly
 * using only built-in Node.js modules
 */

async function testSupabaseDirect() {
  console.log('🔍 TESTING SUPABASE DATABASE DIRECTLY\n');
  
  const SUPABASE_URL = 'https://fgmljvcczanglzattxrs.supabase.co';
  const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbWxqdmNjemFuZ2x6YXR0eHJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTEzNTg4MiwiZXhwIjoyMDc2NzExODgyfQ.VjNwP2UknvSdVUkivPJYLP3S5X0qw7YcnFjH95DEjv8';
  
  try {
    console.log('1️⃣ Testing authenticate_superadmin function...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/authenticate_superadmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({
        p_user: 'superadmin',
        p_pass: 'superadmin123'
      })
    });
    
    console.log('   📊 Status:', response.status);
    console.log('   📊 Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('   📊 Response:', responseText);
    
    if (response.ok) {
      console.log('   ✅ SUCCESS! Database function works');
      try {
        const data = JSON.parse(responseText);
        if (data && data.length > 0 && data[0].is_authenticated) {
          console.log('   ✅ Authentication successful');
          console.log('   🎫 Token generated:', data[0].token ? 'Yes' : 'No');
        } else {
          console.log('   ❌ Authentication failed: Invalid credentials');
        }
      } catch (parseError) {
        console.log('   ⚠️ Response is not JSON:', responseText);
      }
    } else {
      console.log('   ❌ FAILED! Database function error');
      console.log('');
      console.log('🔧 TROUBLESHOOTING:');
      if (response.status === 404) {
        console.log('- Function authenticate_superadmin does not exist');
        console.log('- Run FIX-SUPERADMIN-AUTH.sql in Supabase SQL Editor');
      } else if (response.status === 401) {
        console.log('- Service role key is invalid');
        console.log('- Check SUPABASE_SERVICE_ROLE_KEY in Vercel');
      } else if (response.status === 400) {
        console.log('- Function parameters are incorrect');
        console.log('- Check function signature');
      }
    }
    
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
    console.log('');
    console.log('🔧 CHECK:');
    console.log('- Is Supabase URL correct?');
    console.log('- Is service role key correct?');
    console.log('- Is Supabase project active?');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 NEXT STEPS:');
  console.log('1. If database test fails → Run FIX-SUPERADMIN-AUTH.sql');
  console.log('2. If database test passes → Check Vercel deployment');
  console.log('3. Provide your Vercel URL for API testing');
  console.log('='.repeat(60));
}

// Run test
testSupabaseDirect().catch(error => {
  console.error('💥 Test failed:', error);
});
