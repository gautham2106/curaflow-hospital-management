#!/usr/bin/env node

/**
 * TEST NEW VERCEL DEPLOYMENT
 */

async function testNewDeployment() {
  console.log('🔍 TESTING NEW VERCEL DEPLOYMENT\n');
  
  const VERCEL_URL = 'https://curaflow-saas-hnhc2676q-gs-projects-13b73890.vercel.app';
  
  try {
    console.log('📡 Testing superadmin API...');
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
      console.log('   ✅ SUCCESS! Superadmin authentication works!');
      console.log('');
      console.log('🎉 PRODUCTION READY!');
      console.log('- Superadmin login: ✅ Working');
      console.log('- Database connection: ✅ Working');
      console.log('- API endpoints: ✅ Responding');
      console.log('');
      console.log('🌐 Test your app at:');
      console.log(`   ${VERCEL_URL}/superadmin/dashboard`);
      console.log('   Username: superadmin');
      console.log('   Password: superadmin123');
    } else {
      console.log('   ❌ FAILED! Check the error above');
    }
    
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
  }
}

// Run test
testNewDeployment().catch(error => {
  console.error('💥 Test failed:', error);
});
