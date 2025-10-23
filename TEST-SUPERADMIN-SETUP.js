// Quick test to check superadmin database setup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please check your .env.local file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSuperadminSetup() {
    console.log('🔍 Testing superadmin database setup...\n');
    
    try {
        // Test 1: Check if superadmins table exists
        console.log('1️⃣ Testing superadmins table...');
        const { data: superadmins, error: superadminError } = await supabase
            .from('superadmins')
            .select('*')
            .limit(1);
        
        if (superadminError) {
            console.log('❌ Superadmins table error:', superadminError.message);
            console.log('   → Run SUPERADMIN-SYSTEM.sql in Supabase SQL Editor');
            return;
        } else {
            console.log('✅ Superadmins table accessible');
            console.log('   Found superadmins:', superadmins?.length || 0);
        }
        
        // Test 2: Check if authenticate_superadmin function exists
        console.log('\n2️⃣ Testing authenticate_superadmin function...');
        const { data: authTest, error: authError } = await supabase.rpc('authenticate_superadmin', {
            p_username: 'superadmin',
            p_password: 'superadmin123'
        });
        
        if (authError) {
            console.log('❌ authenticate_superadmin function error:', authError.message);
            console.log('   → Run SUPERADMIN-SYSTEM.sql in Supabase SQL Editor');
        } else {
            console.log('✅ authenticate_superadmin function works');
            console.log('   Result:', authTest);
        }
        
        // Test 3: Check if superadmin_sessions table exists
        console.log('\n3️⃣ Testing superadmin_sessions table...');
        const { data: sessions, error: sessionError } = await supabase
            .from('superadmin_sessions')
            .select('*')
            .limit(1);
        
        if (sessionError) {
            console.log('❌ Superadmin_sessions table error:', sessionError.message);
            console.log('   → Run SUPERADMIN-SYSTEM.sql in Supabase SQL Editor');
        } else {
            console.log('✅ Superadmin_sessions table accessible');
        }
        
        // Test 4: Check if default superadmin exists
        console.log('\n4️⃣ Testing default superadmin...');
        const { data: defaultAdmin, error: defaultError } = await supabase
            .from('superadmins')
            .select('*')
            .eq('username', 'superadmin')
            .single();
        
        if (defaultError) {
            console.log('❌ Default superadmin not found:', defaultError.message);
            console.log('   → Run SUPERADMIN-SYSTEM.sql in Supabase SQL Editor');
        } else {
            console.log('✅ Default superadmin found');
            console.log('   Username:', defaultAdmin.username);
            console.log('   Active:', defaultAdmin.is_active);
        }
        
    } catch (error) {
        console.error('❌ Database test error:', error.message);
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. If any tests failed, run SUPERADMIN-SYSTEM.sql in Supabase');
    console.log('2. Check your Supabase project settings');
    console.log('3. Verify environment variables in Vercel');
    console.log('4. Test superadmin login at: https://curaflow-hospital-management.vercel.app/superadmin/dashboard');
}

testSuperadminSetup().catch(console.error);
