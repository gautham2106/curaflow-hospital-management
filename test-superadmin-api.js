#!/usr/bin/env node

/**
 * QUICK SUPERADMIN API TEST
 * 
 * This script tests the superadmin API endpoints directly
 * to identify what's causing the 500 error
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSuperadminAPI() {
  console.log('🔍 TESTING SUPERADMIN API ENDPOINTS\n');
  
  // Test 1: Direct database authentication
  console.log('1️⃣ Testing direct database authentication...');
  try {
    const { data, error } = await supabase.rpc('authenticate_superadmin', {
      p_username: 'superadmin',
      p_password: 'superadmin123'
    });
    
    if (error) {
      console.log('   ❌ Database authentication failed:', error.message);
      return;
    }
    
    if (data && data.length > 0 && data[0].is_authenticated) {
      console.log('   ✅ Database authentication successful');
      console.log('   🎫 Token:', data[0].token ? 'Generated' : 'Missing');
      
      // Test 2: Session validation
      console.log('\n2️⃣ Testing session validation...');
      const { data: validationData, error: validationError } = await supabase.rpc('validate_superadmin_session', {
        p_token: data[0].token
      });
      
      if (validationError) {
        console.log('   ❌ Session validation failed:', validationError.message);
      } else if (validationData && validationData.length > 0 && validationData[0].is_valid) {
        console.log('   ✅ Session validation successful');
      } else {
        console.log('   ❌ Session validation failed: Invalid token');
      }
      
    } else {
      console.log('   ❌ Authentication failed: Invalid credentials');
    }
    
  } catch (error) {
    console.log('   ❌ Database test failed:', error.message);
  }
  
  // Test 3: Check API endpoint simulation
  console.log('\n3️⃣ Simulating API endpoint call...');
  try {
    // Simulate what the frontend does
    const token = 'test-token';
    const response = await fetch('http://localhost:3000/api/superadmin/auth', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   📊 Response status:', response.status);
    console.log('   📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('   📊 Response body:', responseText);
    
  } catch (error) {
    console.log('   ⚠️ API endpoint test failed (expected if server not running):', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🔧 DIAGNOSIS COMPLETE');
  console.log('='.repeat(50));
}

// Run test
testSuperadminAPI().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
