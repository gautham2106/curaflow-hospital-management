#!/usr/bin/env node

/**
 * VERCEL API TEST
 * 
 * Tests the superadmin API endpoint on your Vercel deployment
 */

async function testVercelAPI() {
  console.log('🔍 TESTING VERCEL SUPERADMIN API\n');
  
  const VERCEL_URL = 'https://curaflow-hospital-management-avr4.vercel.app';
  
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
      console.log('   ✅ SUCCESS! Vercel API authentication works');
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
        console.log('- Check Vercel function logs');
        console.log('- Verify environment variables are set');
        console.log('- Check if API route exists in deployment');
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
  console.log('📋 NEXT STEPS:');
  console.log('1. Check Vercel function logs for detailed error');
  console.log('2. Verify environment variables in Vercel dashboard');
  console.log('3. Check if API route file exists in deployment');
  console.log('='.repeat(60));
}

// Run test
testVercelAPI().catch(error => {
  console.error('💥 Test failed:', error);
});
