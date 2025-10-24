#!/usr/bin/env node

/**
 * DEBUG SESSION ISSUE
 */

async function debugSessionIssue() {
  console.log('🔍 DEBUGGING SESSION ISSUE\n');
  
  const VERCEL_URL = 'https://curaflow-saas-c8ps4x4dz-gs-projects-13b73890.vercel.app';
  
  try {
    console.log('1️⃣ Testing login to get session token...');
    
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
      console.log('   🎫 Token received:', loginData.token ? 'Yes' : 'No');
      
      if (loginData.token) {
        console.log('\n2️⃣ Testing session validation with received token...');
        
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
        } else {
          console.log('   ❌ Session validation failed');
        }
      }
    } else {
      const loginText = await loginResponse.text();
      console.log('   ❌ Login failed:', loginText);
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 DIAGNOSIS:');
  console.log('1. If login works but session fails → Token storage issue');
  console.log('2. If both fail → API endpoint issue');
  console.log('3. Check browser console for detailed errors');
  console.log('='.repeat(60));
}

// Run test
debugSessionIssue().catch(error => {
  console.error('💥 Test failed:', error);
});
