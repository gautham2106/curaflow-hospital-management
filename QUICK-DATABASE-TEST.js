// Quick database verification script
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

async function testDatabaseSetup() {
    console.log('🔍 Testing database setup...\n');
    
    try {
        // Test 1: Check if authenticate_clinic function exists
        console.log('1️⃣ Testing authenticate_clinic function...');
        const { data: authTest, error: authError } = await supabase.rpc('authenticate_clinic', {
            p_username: 'admin',
            p_pin: '1234'
        });
        
        if (authError) {
            console.log('❌ authenticate_clinic function error:', authError.message);
            console.log('   → Run SUPERADMIN-SYSTEM.sql in Supabase SQL Editor');
        } else {
            console.log('✅ authenticate_clinic function works');
            console.log('   Result:', authTest);
        }
        
        // Test 2: Check if clinics table has auth fields
        console.log('\n2️⃣ Testing clinics table structure...');
        const { data: clinics, error: clinicsError } = await supabase
            .from('clinics')
            .select('id, name, admin_username, admin_pin, is_active')
            .limit(5);
        
        if (clinicsError) {
            console.log('❌ Clinics table error:', clinicsError.message);
            console.log('   → Run FINAL-COMPLETE-SQL.sql in Supabase SQL Editor');
        } else {
            console.log('✅ Clinics table accessible');
            console.log('   Found clinics:', clinics?.length || 0);
            if (clinics && clinics.length > 0) {
                clinics.forEach(clinic => {
                    console.log(`   - ${clinic.name}: ${clinic.admin_username} / ${clinic.admin_pin} (${clinic.is_active ? 'active' : 'inactive'})`);
                });
            }
        }
        
        // Test 3: Check superadmin table
        console.log('\n3️⃣ Testing superadmin table...');
        const { data: superadmins, error: superadminError } = await supabase
            .from('superadmins')
            .select('username, is_active')
            .limit(5);
        
        if (superadminError) {
            console.log('❌ Superadmin table error:', superadminError.message);
            console.log('   → Run SUPERADMIN-SYSTEM.sql in Supabase SQL Editor');
        } else {
            console.log('✅ Superadmin table accessible');
            console.log('   Found superadmins:', superadmins?.length || 0);
            if (superadmins && superadmins.length > 0) {
                superadmins.forEach(admin => {
                    console.log(`   - ${admin.username} (${admin.is_active ? 'active' : 'inactive'})`);
                });
            }
        }
        
        // Test 4: Test actual login
        console.log('\n4️⃣ Testing actual login...');
        const { data: loginTest, error: loginError } = await supabase.rpc('authenticate_clinic', {
            p_username: 'admin',
            p_pin: '1234'
        });
        
        if (loginError) {
            console.log('❌ Login test error:', loginError.message);
        } else if (loginTest && loginTest.length > 0 && loginTest[0].is_authenticated) {
            console.log('✅ Login test successful!');
            console.log('   Clinic:', loginTest[0].clinic_name);
            console.log('   Admin:', loginTest[0].admin_name);
        } else {
            console.log('❌ Login test failed - credentials not found');
            console.log('   → Check if default clinics were created in SUPERADMIN-SYSTEM.sql');
        }
        
    } catch (error) {
        console.error('❌ Database test error:', error.message);
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. If any tests failed, run the corresponding SQL script');
    console.log('2. Check your Supabase project settings');
    console.log('3. Verify environment variables in Vercel');
    console.log('4. Test login at: https://curaflow-hospital-management.vercel.app/login');
    console.log('5. Test superadmin at: https://curaflow-hospital-management.vercel.app/superadmin/dashboard');
}

testDatabaseSetup().catch(console.error);
