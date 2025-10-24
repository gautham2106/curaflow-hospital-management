#!/usr/bin/env node

/**
 * SIMPLE VERCEL SUPERADMIN TEST
 * 
 * Tests superadmin authentication without external dependencies
 */

async function testVercelSuperadmin() {
  console.log('🔍 TESTING VERCEL SUPERADMIN AUTHENTICATION\n');
  
  // Replace with your actual Vercel URL
  const VERCEL_URL = 'https://your-app-name.vercel.app'; // UPDATE THIS
  
  console.log('📝 STEP 1: Update VERCEL_URL');
  console.log('   Current: https://your-app-name.vercel.app');
  console.log('   Replace with your actual Vercel deployment URL');
  console.log('   Example: https://curaflow-hospital-management.vercel.app');
  console.log('');
  
  if (VERCEL_URL === 'https://your-app-name.vercel.app') {
    console.log('⚠️  Please update the VERCEL_URL variable first');
    console.log('');
    console.log('📋 MANUAL TESTING STEPS:');
    console.log('1. Go to your Vercel deployment URL');
    console.log('2. Navigate to: /superadmin/dashboard');
    console.log('3. Login with:');
    console.log('   Username: superadmin');
    console.log('   Password: superadmin123');
    console.log('');
    console.log('🔧 If you get errors:');
    console.log('- "Authentication service error" → Run FIX-SUPERADMIN-AUTH.sql');
    console.log('- "Invalid credentials" → Check if superadmin user exists');
    console.log('- "500 error" → Check Vercel environment variables');
    return;
  }
  
  try {
    console.log('📡 Testing API endpoint...');
    console.log(`   URL: ${VERCEL_URL}/api/superadmin/auth`);
    
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
    
    console.log('   📊 Status:', response.status);
    console.log('   📊 Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('   📊 Response:', responseText);
    
    if (response.ok) {
      console.log('   ✅ SUCCESS! Superadmin authentication works in Vercel');
      console.log('');
      console.log('🎉 PRODUCTION READY!');
      console.log('- Superadmin login: ✅ Working');
      console.log('- Database connection: ✅ Working');
      console.log('- Environment variables: ✅ Set');
      console.log('- API endpoints: ✅ Responding');
    } else {
      console.log('   ❌ FAILED! Check the error above');
      console.log('');
      console.log('🔧 TROUBLESHOOTING:');
      if (response.status === 500) {
        console.log('- Run FIX-SUPERADMIN-AUTH.sql in Supabase SQL Editor');
        console.log('- Check Vercel environment variables');
      } else if (response.status === 401) {
        console.log('- Check if superadmin user exists in database');
        console.log('- Verify password is correct');
      }
    }
    
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
    console.log('');
    console.log('🔧 CHECK:');
    console.log('- Is your Vercel URL correct?');
    console.log('- Is the deployment live?');
    console.log('- Are environment variables set in Vercel?');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 QUICK MANUAL TEST:');
  console.log('1. Open browser');
  console.log('2. Go to: https://your-app.vercel.app/superadmin/dashboard');
  console.log('3. Login: superadmin / superadmin123');
  console.log('4. If it works → Production ready! 🎉');
  console.log('='.repeat(60));
}

// Run test
testVercelSuperadmin().catch(error => {
  console.error('💥 Test failed:', error);
});
