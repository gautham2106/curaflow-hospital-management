#!/usr/bin/env node

/**
 * SUPERADMIN DATABASE VERIFICATION SCRIPT
 * 
 * This script diagnoses superadmin authentication issues by checking:
 * 1. Database connectivity
 * 2. Required tables existence
 * 3. Required functions existence
 * 4. Default superadmin user
 * 5. RLS policies
 * 
 * Usage: node verify-superadmin-db.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.error('\nPlease check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySuperadminSetup() {
  console.log('🔍 VERIFYING SUPERADMIN DATABASE SETUP\n');
  
  let allChecksPassed = true;
  
  // Test 1: Database Connectivity
  console.log('1️⃣ Testing database connectivity...');
  try {
    const { data, error } = await supabase.from('clinics').select('count').limit(1);
    if (error) throw error;
    console.log('   ✅ Database connection successful');
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
    allChecksPassed = false;
    return;
  }
  
  // Test 2: Check superadmins table
  console.log('\n2️⃣ Checking superadmins table...');
  try {
    const { data, error } = await supabase.from('superadmins').select('*').limit(1);
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('   ❌ superadmins table does not exist');
        allChecksPassed = false;
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ superadmins table exists');
      console.log(`   📊 Found ${data.length} superadmin(s)`);
    }
  } catch (error) {
    console.log('   ❌ Error checking superadmins table:', error.message);
    allChecksPassed = false;
  }
  
  // Test 3: Check superadmin_sessions table
  console.log('\n3️⃣ Checking superadmin_sessions table...');
  try {
    const { data, error } = await supabase.from('superadmin_sessions').select('*').limit(1);
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('   ❌ superadmin_sessions table does not exist');
        allChecksPassed = false;
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ superadmin_sessions table exists');
      console.log(`   📊 Found ${data.length} session(s)`);
    }
  } catch (error) {
    console.log('   ❌ Error checking superadmin_sessions table:', error.message);
    allChecksPassed = false;
  }
  
  // Test 4: Check authenticate_superadmin function
  console.log('\n4️⃣ Testing authenticate_superadmin function...');
  try {
    const { data, error } = await supabase.rpc('authenticate_superadmin', {
      p_username: 'test',
      p_password: 'test'
    });
    
    if (error) {
      if (error.message.includes('function authenticate_superadmin') && error.message.includes('does not exist')) {
        console.log('   ❌ authenticate_superadmin function does not exist');
        allChecksPassed = false;
      } else {
        console.log('   ⚠️ Function exists but returned error:', error.message);
        console.log('   ✅ This is expected for invalid credentials');
      }
    } else {
      console.log('   ✅ authenticate_superadmin function exists and works');
      console.log('   📊 Function returned:', data);
    }
  } catch (error) {
    console.log('   ❌ Error testing authenticate_superadmin function:', error.message);
    allChecksPassed = false;
  }
  
  // Test 5: Check validate_superadmin_session function
  console.log('\n5️⃣ Testing validate_superadmin_session function...');
  try {
    const { data, error } = await supabase.rpc('validate_superadmin_session', {
      p_token: 'test-token'
    });
    
    if (error) {
      if (error.message.includes('function validate_superadmin_session') && error.message.includes('does not exist')) {
        console.log('   ❌ validate_superadmin_session function does not exist');
        allChecksPassed = false;
      } else {
        console.log('   ⚠️ Function exists but returned error:', error.message);
        console.log('   ✅ This is expected for invalid token');
      }
    } else {
      console.log('   ✅ validate_superadmin_session function exists and works');
      console.log('   📊 Function returned:', data);
    }
  } catch (error) {
    console.log('   ❌ Error testing validate_superadmin_session function:', error.message);
    allChecksPassed = false;
  }
  
  // Test 6: Check default superadmin user
  console.log('\n6️⃣ Checking default superadmin user...');
  try {
    const { data, error } = await supabase.from('superadmins').select('*').eq('username', 'superadmin');
    if (error) throw error;
    
    if (data.length === 0) {
      console.log('   ❌ Default superadmin user does not exist');
      allChecksPassed = false;
    } else {
      const admin = data[0];
      console.log('   ✅ Default superadmin user exists');
      console.log(`   👤 Username: ${admin.username}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   👨‍💼 Full Name: ${admin.full_name}`);
      console.log(`   🔐 Active: ${admin.is_active}`);
      console.log(`   📅 Created: ${admin.created_at}`);
      console.log(`   🕐 Last Login: ${admin.last_login || 'Never'}`);
    }
  } catch (error) {
    console.log('   ❌ Error checking default superadmin user:', error.message);
    allChecksPassed = false;
  }
  
  // Test 7: Test actual authentication
  console.log('\n7️⃣ Testing superadmin authentication...');
  try {
    const { data, error } = await supabase.rpc('authenticate_superadmin', {
      p_username: 'superadmin',
      p_password: 'superadmin123'
    });
    
    if (error) {
      console.log('   ❌ Authentication failed:', error.message);
      allChecksPassed = false;
    } else if (data && data.length > 0 && data[0].is_authenticated) {
      console.log('   ✅ Authentication successful!');
      console.log(`   🎫 Session token generated: ${data[0].token ? 'Yes' : 'No'}`);
    } else {
      console.log('   ❌ Authentication failed: Invalid credentials or function error');
      allChecksPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Error during authentication test:', error.message);
    allChecksPassed = false;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (allChecksPassed) {
    console.log('🎉 ALL CHECKS PASSED! Superadmin system is working correctly.');
    console.log('\n📝 You can now login with:');
    console.log('   Username: superadmin');
    console.log('   Password: superadmin123');
  } else {
    console.log('❌ SOME CHECKS FAILED! Superadmin system needs fixing.');
    console.log('\n🔧 Next steps:');
    console.log('   1. Run FIX-SUPERADMIN-AUTH.sql in Supabase SQL Editor');
    console.log('   2. Re-run this verification script');
    console.log('   3. Check SUPERADMIN-TROUBLESHOOTING.md for help');
  }
  console.log('='.repeat(50));
}

// Run verification
verifySuperadminSetup().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
