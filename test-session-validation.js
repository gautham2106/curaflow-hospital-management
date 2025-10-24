#!/usr/bin/env node

/**
 * TEST SESSION VALIDATION FUNCTION
 */

async function testSessionValidation() {
  console.log('🔍 TESTING SESSION VALIDATION FUNCTION\n');
  
  const SUPABASE_URL = 'https://fgmljvcczanglzattxrs.supabase.co';
  const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbWxqdmNjemFuZ2x6YXR0eHJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTEzNTg4MiwiZXhwIjoyMDc2NzExODgyfQ.VjNwP2UknvSdVUkivPJYLP3S5X0qw7YcnFjH95DEjv8';
  
  try {
    console.log('1️⃣ Testing validate_superadmin_session function...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/validate_superadmin_session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({
        p_token: 'test-token-123'
      })
    });
    
    console.log('   📊 Status:', response.status);
    console.log('   📊 Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('   📊 Response:', responseText);
    
    if (response.ok) {
      console.log('   ✅ SUCCESS! Session validation function exists');
    } else {
      console.log('   ❌ FAILED! Session validation function error');
      console.log('');
      console.log('🔧 TROUBLESHOOTING:');
      if (response.status === 404) {
        console.log('- Function validate_superadmin_session does not exist');
        console.log('- Need to create this function in database');
      } else if (response.status === 400) {
        console.log('- Function parameters are incorrect');
        console.log('- Check function signature');
      }
    }
    
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 NEXT STEPS:');
  console.log('1. If function missing → Create validate_superadmin_session function');
  console.log('2. If function exists → Check parameter names');
  console.log('3. Test with actual session token');
  console.log('='.repeat(60));
}

// Run test
testSessionValidation().catch(error => {
  console.error('💥 Test failed:', error);
});
