#!/usr/bin/env node

/**
 * SIMPLE SUPERADMIN DATABASE TEST
 * 
 * Tests the database connection and authentication function
 * without requiring npm dependencies
 */

// Simple test using fetch to check if the server is running
async function testServer() {
  console.log('🔍 TESTING SUPERADMIN SERVER CONNECTION\n');
  
  try {
    // Test if the server is running
    console.log('1️⃣ Testing server connection...');
    const response = await fetch('http://localhost:9002/api/superadmin/auth', {
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
    console.log('   📊 Response status text:', response.statusText);
    
    const responseText = await response.text();
    console.log('   📊 Response body:', responseText);
    
    if (response.ok) {
      console.log('   ✅ Superadmin authentication successful!');
    } else {
      console.log('   ❌ Superadmin authentication failed');
      
      if (response.status === 500) {
        console.log('\n🔧 500 ERROR DIAGNOSIS:');
        console.log('   - Check if Supabase environment variables are set');
        console.log('   - Verify FIX-SUPERADMIN-AUTH.sql was run completely');
        console.log('   - Check server console for detailed error messages');
        console.log('   - Ensure database functions exist');
      }
    }
    
  } catch (error) {
    console.log('   ❌ Server connection failed:', error.message);
    console.log('\n🔧 CONNECTION ISSUE:');
    console.log('   - Make sure the Next.js server is running (npm run dev)');
    console.log('   - Check if port 9002 is available');
    console.log('   - Verify .env.local file exists with Supabase credentials');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 NEXT STEPS:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Check browser console for detailed errors');
  console.log('3. Verify Supabase credentials in .env.local');
  console.log('4. Run FIX-SUPERADMIN-AUTH.sql if not done already');
  console.log('='.repeat(50));
}

// Run test
testServer().catch(error => {
  console.error('💥 Test failed:', error);
});
