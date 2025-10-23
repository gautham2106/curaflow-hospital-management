const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
  console.log('Service Key:', supabaseKey ? '✅ Present' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...\n');
    
    // Check clinics table
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('*');
    
    if (clinicsError) {
      console.error('❌ Error fetching clinics:', clinicsError);
      return;
    }
    
    console.log('📋 Clinics in database:');
    clinics.forEach(clinic => {
      console.log(`  - ID: ${clinic.id} (type: ${typeof clinic.id})`);
      console.log(`    Name: ${clinic.name}`);
      console.log(`    Created: ${clinic.created_at}`);
      console.log('');
    });
    
    // Check if IDs are UUIDs or strings
    const hasStringIds = clinics.some(clinic => typeof clinic.id === 'string' && !clinic.id.includes('-'));
    const hasUuidIds = clinics.some(clinic => typeof clinic.id === 'string' && clinic.id.includes('-'));
    
    console.log('🔍 Analysis:');
    console.log(`  - Has string IDs: ${hasStringIds ? '❌ Yes' : '✅ No'}`);
    console.log(`  - Has UUID IDs: ${hasUuidIds ? '✅ Yes' : '❌ No'}`);
    
    if (hasStringIds) {
      console.log('\n⚠️  Database still has old string IDs!');
      console.log('📝 You need to run the UUID migration SQL.');
    } else if (hasUuidIds) {
      console.log('\n✅ Database has proper UUIDs!');
    } else {
      console.log('\n❓ No clinics found in database.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabaseState();
