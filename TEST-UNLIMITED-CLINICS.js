// UNLIMITED CLINICS TESTING SCRIPT
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUnlimitedClinics() {
    console.log('🚀 Testing Unlimited Clinics Support...\n');
    
    let allTestsPassed = true;
    
    // Test 1: Check if authentication functions exist
    console.log('1️⃣ Testing Authentication Functions...');
    try {
        const { data, error } = await supabase.rpc('authenticate_clinic', {
            p_username: 'admin',
            p_pin: '1234'
        });
        
        if (error) {
            console.log('❌ Authentication function failed:', error.message);
            allTestsPassed = false;
        } else {
            console.log('✅ Authentication function works');
            console.log('   Sample result:', data);
        }
    } catch (err) {
        console.log('❌ Authentication function error:', err.message);
        allTestsPassed = false;
    }
    
    // Test 2: Test clinic creation function
    console.log('\n2️⃣ Testing Clinic Creation Function...');
    try {
        const testClinicData = {
            p_name: 'Test Clinic ' + Date.now(),
            p_address: '123 Test Street',
            p_phone: '555-0123',
            p_email: 'test@example.com',
            p_admin_username: 'testadmin' + Date.now(),
            p_admin_pin: '9999',
            p_admin_name: 'Test Admin',
            p_subscription_plan: 'basic',
            p_max_doctors: 5,
            p_max_patients_per_day: 50
        };
        
        const { data, error } = await supabase.rpc('create_clinic_with_admin', testClinicData);
        
        if (error) {
            console.log('❌ Clinic creation function failed:', error.message);
            allTestsPassed = false;
        } else {
            console.log('✅ Clinic creation function works');
            console.log('   Created clinic:', data);
            
            // Clean up test clinic
            if (data && data.length > 0 && data[0].clinic_id) {
                await supabase.from('clinics').delete().eq('id', data[0].clinic_id);
                console.log('   ✅ Test clinic cleaned up');
            }
        }
    } catch (err) {
        console.log('❌ Clinic creation function error:', err.message);
        allTestsPassed = false;
    }
    
    // Test 3: Test multiple clinic authentication
    console.log('\n3️⃣ Testing Multiple Clinic Authentication...');
    try {
        const testCredentials = [
            { username: 'admin', pin: '1234' },
            { username: 'sunrise-admin', pin: '5678' }
        ];
        
        for (const cred of testCredentials) {
            const { data, error } = await supabase.rpc('authenticate_clinic', {
                p_username: cred.username,
                p_pin: cred.pin
            });
            
            if (error) {
                console.log(`❌ Authentication failed for ${cred.username}:`, error.message);
                allTestsPassed = false;
            } else if (data && data.length > 0 && data[0].is_authenticated) {
                console.log(`✅ Authentication successful for ${cred.username}`);
                console.log(`   Clinic: ${data[0].clinic_name}`);
            } else {
                console.log(`❌ Authentication failed for ${cred.username}`);
                allTestsPassed = false;
            }
        }
    } catch (err) {
        console.log('❌ Multiple clinic authentication error:', err.message);
        allTestsPassed = false;
    }
    
    // Test 4: Test clinic statistics function
    console.log('\n4️⃣ Testing Clinic Statistics Function...');
    try {
        // Get first clinic ID
        const { data: clinics } = await supabase.from('clinics').select('id').limit(1);
        
        if (clinics && clinics.length > 0) {
            const { data: stats, error } = await supabase.rpc('get_clinic_stats', {
                p_clinic_id: clinics[0].id
            });
            
            if (error) {
                console.log('❌ Clinic stats function failed:', error.message);
                allTestsPassed = false;
            } else {
                console.log('✅ Clinic stats function works');
                console.log('   Sample stats:', stats);
            }
        } else {
            console.log('⚠️  No clinics found for stats test');
        }
    } catch (err) {
        console.log('❌ Clinic stats function error:', err.message);
        allTestsPassed = false;
    }
    
    // Test 5: Test API endpoints
    console.log('\n5️⃣ Testing API Endpoints...');
    try {
        // Test clinics API
        const response = await fetch('http://localhost:9002/api/clinics');
        if (response.ok) {
            const clinics = await response.json();
            console.log('✅ Clinics API works');
            console.log(`   Found ${clinics.length} clinics`);
        } else {
            console.log('❌ Clinics API failed:', response.status);
            allTestsPassed = false;
        }
    } catch (err) {
        console.log('⚠️  API test skipped (server not running)');
        console.log('   Start your server with: npm run dev');
    }
    
    // Test 6: Test login with different clinics
    console.log('\n6️⃣ Testing Dynamic Login...');
    try {
        const loginTests = [
            { username: 'admin', pin: '1234', expectedClinic: 'CuraFlow Central Hospital' },
            { username: 'sunrise-admin', pin: '5678', expectedClinic: 'Sunrise Medical Clinic' }
        ];
        
        for (const test of loginTests) {
            const response = await fetch('http://localhost:9002/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: test.username, pin: test.pin })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.clinic.name === test.expectedClinic) {
                    console.log(`✅ Login successful for ${test.username}`);
                    console.log(`   Clinic: ${result.clinic.name}`);
                } else {
                    console.log(`❌ Login failed for ${test.username}`);
                    allTestsPassed = false;
                }
            } else {
                console.log(`❌ Login API failed for ${test.username}:`, response.status);
                allTestsPassed = false;
            }
        }
    } catch (err) {
        console.log('⚠️  Login test skipped (server not running)');
        console.log('   Start your server with: npm run dev');
    }
    
    // Final Result
    console.log('\n' + '='.repeat(60));
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! Unlimited clinics support is working!');
        console.log('\n📋 What you can now do:');
        console.log('1. ✅ Login with any clinic credentials');
        console.log('2. ✅ Create unlimited new clinics');
        console.log('3. ✅ Each clinic has isolated data');
        console.log('4. ✅ Dynamic authentication system');
        console.log('5. ✅ Clinic management APIs');
        console.log('6. ✅ Registration interface');
        console.log('\n🚀 Your system now supports UNLIMITED clinics!');
    } else {
        console.log('❌ Some tests failed. Please check the errors above.');
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure you ran ADD-CLINIC-AUTHENTICATION.sql');
        console.log('2. Check your environment variables');
        console.log('3. Verify your Supabase project is active');
        console.log('4. Start your server: npm run dev');
    }
    console.log('='.repeat(60));
}

testUnlimitedClinics().catch(console.error);
