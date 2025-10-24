#!/usr/bin/env node

/**
 * TEST NEW DEPLOYMENT WITHOUT PROTECTION
 */

async function testNewDeployment() {
  console.log('🔍 TESTING NEW DEPLOYMENT WITHOUT PROTECTION\n');
  
  const VERCEL_URL = 'https://curaflow-saas-3mj76316b-gs-projects-13b73890.vercel.app';
  
  try {
    console.log('📡 Testing superadmin login...');
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
      console.log('   ✅ SUCCESS! Login works without protection');
      
      try {
        const loginData = JSON.parse(responseText);
        if (loginData.token) {
          console.log('\n📡 Testing session validation...');
          
          const sessionResponse = await fetch(`${VERCEL_URL}/api/superadmin/auth`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${loginData.token}`,
              'Content-Type': 'application/json',
            }
          });
          
          console.log('   📊 Session Status:', sessionResponse.status);
          
          if (sessionResponse.ok) {
            console.log('   ✅ SUCCESS! Session validation works');
            console.log('');
            console.log('🎉 COMPLETE SUCCESS!');
            console.log('- Login: ✅ Working');
            console.log('- Session validation: ✅ Working');
            console.log('- Protection disabled: ✅ Working');
            console.log('');
            console.log('🌐 Test your app at:');
            console.log(`   ${VERCEL_URL}/superadmin/dashboard`);
            console.log('   Username: superadmin');
            console.log('   Password: superadmin123');
          } else {
            console.log('   ❌ Session validation failed');
          }
        }
      } catch (parseError) {
        console.log('   ⚠️ Response is not JSON:', responseText);
      }
    } else {
      console.log('   ❌ FAILED! Still blocked by protection');
    }
    
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
  }
}

// Run test
testNewDeployment().catch(error => {
  console.error('💥 Test failed:', error);
});
