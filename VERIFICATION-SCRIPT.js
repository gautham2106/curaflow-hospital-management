// VERIFICATION SCRIPT - Run this to test 100% integration
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteIntegration() {
    console.log('🚀 Testing Complete CuraFlow Integration...\n');
    
    let allTestsPassed = true;
    
    // Test 1: Database Connection
    console.log('1️⃣ Testing Database Connection...');
    try {
        const { data, error } = await supabase.from('clinics').select('count').limit(1);
        if (error) throw error;
        console.log('✅ Database connection successful');
    } catch (err) {
        console.log('❌ Database connection failed:', err.message);
        allTestsPassed = false;
    }
    
    // Test 2: All Tables Exist
    console.log('\n2️⃣ Testing All Tables...');
    const tables = ['clinics', 'doctors', 'patients', 'visits', 'queue', 'sessions', 'departments', 'ad_resources'];
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) throw error;
            console.log(`✅ Table ${table} accessible`);
        } catch (err) {
            console.log(`❌ Table ${table} failed:`, err.message);
            allTestsPassed = false;
        }
    }
    
    // Test 3: Required Columns Exist
    console.log('\n3️⃣ Testing Required Columns...');
    try {
        const { data, error } = await supabase
            .from('visits')
            .select('was_skipped, skip_reason, was_out_of_turn, out_of_turn_reason')
            .limit(1);
        if (error) throw error;
        console.log('✅ All required columns exist in visits table');
    } catch (err) {
        console.log('❌ Missing required columns:', err.message);
        allTestsPassed = false;
    }
    
    // Test 4: Database Functions Work
    console.log('\n4️⃣ Testing Database Functions...');
    try {
        // Test get_full_queue function
        const { data: clinics } = await supabase.from('clinics').select('id').limit(1);
        if (clinics && clinics.length > 0) {
            const { data: queue, error: queueError } = await supabase
                .rpc('get_full_queue', { p_clinic_id: clinics[0].id });
            if (queueError) throw queueError;
            console.log('✅ get_full_queue function works');
        }
    } catch (err) {
        console.log('❌ Database functions failed:', err.message);
        allTestsPassed = false;
    }
    
    // Test 5: Sample Data Exists
    console.log('\n5️⃣ Testing Sample Data...');
    try {
        const { data: clinics, error } = await supabase.from('clinics').select('*');
        if (error) throw error;
        
        if (clinics && clinics.length >= 2) {
            console.log(`✅ Found ${clinics.length} clinics`);
            console.log('   Sample clinics:', clinics.map(c => c.name));
        } else {
            console.log('⚠️  Insufficient sample data - run the complete setup SQL');
            allTestsPassed = false;
        }
    } catch (err) {
        console.log('❌ Sample data test failed:', err.message);
        allTestsPassed = false;
    }
    
    // Test 6: CRUD Operations
    console.log('\n6️⃣ Testing CRUD Operations...');
    try {
        // Test Create
        const { data: newDept, error: createError } = await supabase
            .from('departments')
            .insert({ 
                clinic_id: (await supabase.from('clinics').select('id').limit(1).single()).data.id,
                name: 'Test Department'
            })
            .select()
            .single();
        
        if (createError) throw createError;
        console.log('✅ Create operation works');
        
        // Test Read
        const { data: dept, error: readError } = await supabase
            .from('departments')
            .select('*')
            .eq('id', newDept.id)
            .single();
        
        if (readError) throw readError;
        console.log('✅ Read operation works');
        
        // Test Update
        const { error: updateError } = await supabase
            .from('departments')
            .update({ name: 'Updated Test Department' })
            .eq('id', newDept.id);
        
        if (updateError) throw updateError;
        console.log('✅ Update operation works');
        
        // Test Delete
        const { error: deleteError } = await supabase
            .from('departments')
            .delete()
            .eq('id', newDept.id);
        
        if (deleteError) throw deleteError;
        console.log('✅ Delete operation works');
        
    } catch (err) {
        console.log('❌ CRUD operations failed:', err.message);
        allTestsPassed = false;
    }
    
    // Final Result
    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! Your CuraFlow integration is 100% ready!');
        console.log('\n📋 Next steps:');
        console.log('1. Start your Next.js server: npm run dev');
        console.log('2. Open http://localhost:9002');
        console.log('3. Login with admin/1234 or sunrise-admin/5678');
        console.log('4. Test all features - everything should work perfectly!');
    } else {
        console.log('❌ Some tests failed. Please check the errors above.');
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure you ran the COMPLETE-SUPABASE-SETUP.sql file');
        console.log('2. Check your environment variables in .env.local');
        console.log('3. Verify your Supabase project is active');
    }
    console.log('='.repeat(50));
}

testCompleteIntegration().catch(console.error);
