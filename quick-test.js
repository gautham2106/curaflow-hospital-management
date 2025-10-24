// Quick test to check Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fgmljvcczanglzattxrs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbWxqdmNjemFuZ2x6YXR0eHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzU4ODIsImV4cCI6MjA3NjcxMTg4Mn0.UoPEDrm64mBjfQI3CzsPrjVtpHJxoVb8K1hSbyp6Tsg';

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Key:', supabaseKey ? '✅ Found' : '❌ Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('clinics').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Test clinics table
    const { data: clinics, error: clinicError } = await supabase
      .from('clinics')
      .select('id, name')
      .limit(5);
      
    if (clinicError) {
      console.error('❌ Error fetching clinics:', clinicError.message);
      return false;
    }
    
    console.log(`✅ Found ${clinics.length} clinic(s):`);
    clinics.forEach(clinic => {
      console.log(`   - ${clinic.name} (${clinic.id})`);
    });
    
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase setup is working correctly!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your Next.js development server: npm run dev');
    console.log('2. Open http://localhost:9002 in your browser');
    console.log('3. Login with: admin/1234 or sunrise-admin/5678');
  } else {
    console.log('\n❌ Setup test failed - check your Supabase configuration');
  }
}).catch(console.error);

