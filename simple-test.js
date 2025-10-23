// Simple test to check Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Read environment variables manually
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const equalIndex = line.indexOf('=');
  if (equalIndex > 0) {
    const key = line.substring(0, equalIndex).trim();
    const value = line.substring(equalIndex + 1).trim();
    if (key && value) {
      envVars[key] = value;
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Key:', supabaseKey ? '✅ Found' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

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
