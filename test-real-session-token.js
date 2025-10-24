#!/usr/bin/env node

/**
 * TEST REAL SESSION TOKEN VALIDATION
 */

async function testRealSessionToken() {
  console.log('🔍 TESTING REAL SESSION TOKEN VALIDATION\n');
  
  const VERCEL_URL = 'https://curaflow-saas-3mj76316b-gs-projects-13b73890.vercel.app';
  
  try {
    console.log('1️⃣ Getting real session token from login...');
    
    const loginResponse = await fetch(`${VERCEL_URL}/api/superadmin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'superadmin123'
      })
    });
    
    console.log('   📊 Login Status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('   ✅ Login successful');
      console.log('   🎫 Token:', loginData.token ? loginData.token.substring(0, 20) + '...' : 'No token');
      
      if (loginData.token) {
        console.log('\n2️⃣ Testing session validation with real token...');
        
        const sessionResponse = await fetch(`${VERCEL_URL}/api/superadmin/auth`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log('   📊 Session Status:', sessionResponse.status);
        const sessionText = await sessionResponse.text();
        console.log('   📊 Session Response:', sessionText);
        
        if (sessionResponse.ok) {
          console.log('   ✅ Session validation successful');
          
          console.log('\n3️⃣ Testing clinic endpoints with real token...');
          
          const clinicsResponse = await fetch(`${VERCEL_URL}/api/superadmin/clinics`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${loginData.token}`,
              'Content-Type': 'application/json',
            }
          });
          
          console.log('   📊 Clinics Status:', clinicsResponse.status);
          
          if (clinicsResponse.ok) {
            console.log('   ✅ Clinics endpoint works!');
            console.log('\n🎉 COMPLETE SUCCESS!');
            console.log('- Login: ✅ Working');
            console.log('- Session validation: ✅ Working');
            console.log('- Clinics endpoint: ✅ Working');
            console.log('');
            console.log('🌐 Your superadmin dashboard should now work perfectly!');
            console.log(`   ${VERCEL_URL}/superadmin/dashboard`);
            console.log('');
            console.log('📋 You can now:');
            console.log('1. Go to the dashboard');
            console.log('2. Click "Clinics" tab');
            console.log('3. Click "Create Clinic" button');
            console.log('4. Add clinics in real-time!');
          } else {
            console.log('   ❌ Clinics endpoint still failing');
            const clinicsText = await clinicsResponse.text();
            console.log('   📊 Clinics Error:', clinicsText);
          }
        } else {
          console.log('   ❌ Session validation failed');
        }
      }
    } else {
      console.log('   ❌ Login failed');
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
}

// Run test
testRealSessionToken().catch(error => {
  console.error('💥 Test failed:', error);
});
