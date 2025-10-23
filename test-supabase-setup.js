// Test script to verify Supabase setup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase connection...');
    
    try {
        // Test basic connection
        const { data, error } = await supabase.from('clinics').select('count').limit(1);
        
        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            return false;
        }
        
        console.log('✅ Supabase connection successful');
        return true;
    } catch (err) {
        console.error('❌ Connection test failed:', err.message);
        return false;
    }
}

async function testDatabaseSchema() {
    console.log('🔍 Testing database schema...');
    
    const tables = [
        'clinics',
        'doctors', 
        'patients',
        'visits',
        'queue',
        'sessions',
        'departments',
        'ad_resources'
    ];
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            
            if (error) {
                console.error(`❌ Table ${table} not accessible:`, error.message);
                return false;
            }
            
            console.log(`✅ Table ${table} accessible`);
        } catch (err) {
            console.error(`❌ Error testing table ${table}:`, err.message);
            return false;
        }
    }
    
    return true;
}

async function testSampleData() {
    console.log('🔍 Testing sample data...');
    
    try {
        // Check if sample clinics exist
        const { data: clinics, error: clinicError } = await supabase
            .from('clinics')
            .select('*')
            .limit(2);
            
        if (clinicError) {
            console.error('❌ Error fetching clinics:', clinicError.message);
            return false;
        }
        
        if (clinics && clinics.length > 0) {
            console.log(`✅ Found ${clinics.length} clinic(s)`);
            console.log('   Sample clinics:', clinics.map(c => c.name));
        } else {
            console.log('⚠️  No clinics found - you may need to run the schema setup');
        }
        
        return true;
    } catch (err) {
        console.error('❌ Error testing sample data:', err.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting Supabase setup test...\n');
    
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest) {
        console.log('\n❌ Setup test failed - check your Supabase credentials');
        process.exit(1);
    }
    
    const schemaTest = await testDatabaseSchema();
    if (!schemaTest) {
        console.log('\n❌ Schema test failed - you may need to run the SQL schema');
        process.exit(1);
    }
    
    const dataTest = await testSampleData();
    if (!dataTest) {
        console.log('\n❌ Data test failed');
        process.exit(1);
    }
    
    console.log('\n🎉 All tests passed! Your Supabase setup is ready.');
    console.log('\n📋 Next steps:');
    console.log('1. Run the SQL schema in your Supabase dashboard');
    console.log('2. Start your Next.js development server: npm run dev');
    console.log('3. Test the application with the mock credentials');
}

main().catch(console.error);
