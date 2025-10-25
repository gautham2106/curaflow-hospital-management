// Test Environment Variables
// Run this in your browser console to verify environment variables are working

console.log('🧪 Testing Environment Variables...');

// Test 1: Check if environment variables are loaded
function testEnvironmentVariables() {
    console.log('📋 Checking environment variables...');
    
    // These should be available in the browser
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
        console.log('✅ Supabase environment variables loaded');
        console.log('   URL:', supabaseUrl);
        console.log('   Anon Key:', supabaseAnonKey.substring(0, 20) + '...');
        return true;
    } else {
        console.log('❌ Supabase environment variables missing');
        return false;
    }
}

// Test 2: Check Supabase connection
async function testSupabaseConnection() {
    try {
        console.log('🔌 Testing Supabase connection...');
        
        const clinicId = sessionStorage.getItem('clinicId');
        if (!clinicId) {
            console.log('⚠️ No clinic ID found - please login first');
            return false;
        }
        
        const response = await fetch('/api/ad-resources', {
            headers: { 'x-clinic-id': clinicId }
        });
        
        if (response.ok) {
            console.log('✅ Supabase connection working');
            return true;
        } else {
            console.log('❌ Supabase connection failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Supabase connection error:', error.message);
        return false;
    }
}

// Test 3: Check WhatsApp API (if configured)
async function testWhatsAppAPI() {
    try {
        console.log('📱 Testing WhatsApp API...');
        
        const clinicId = sessionStorage.getItem('clinicId');
        if (!clinicId) {
            console.log('⚠️ No clinic ID found - please login first');
            return false;
        }
        
        // Test with dummy data
        const testData = {
            tokenData: {
                id: 'test',
                patientName: 'Test Patient',
                phone: '+1234567890',
                tokenNumber: 1,
                date: new Date().toISOString(),
                session: 'Morning',
                doctor: { id: 'test', name: 'Test Doctor', specialty: 'General' },
                clinicId: clinicId
            },
            sessionTimeRange: '9:00 AM - 12:00 PM',
            clinicName: 'Test Clinic'
        };
        
        const response = await fetch('/api/notifications/whatsapp', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-clinic-id': clinicId
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ WhatsApp API working');
            return true;
        } else if (result.error && result.error.includes('Missing WHATSAPP_ACCESS_TOKEN')) {
            console.log('⚠️ WhatsApp API not configured (missing credentials)');
            return 'not-configured';
        } else {
            console.log('❌ WhatsApp API failed:', result.error || response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ WhatsApp API error:', error.message);
        return false;
    }
}

// Test 4: Check file upload (if storage is set up)
async function testFileUpload() {
    try {
        console.log('📁 Testing file upload capability...');
        
        // Check if we can access the storage service
        if (typeof SupabaseStorageService !== 'undefined') {
            console.log('✅ File upload service available');
            return true;
        } else {
            console.log('⚠️ File upload service not loaded');
            return false;
        }
    } catch (error) {
        console.log('❌ File upload test error:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting environment variable tests...\n');
    
    const results = {
        envVariables: testEnvironmentVariables(),
        supabaseConnection: await testSupabaseConnection(),
        whatsappAPI: await testWhatsAppAPI(),
        fileUpload: testFileUpload()
    };
    
    console.log('\n📊 Test Results:');
    console.log('================');
    
    Object.entries(results).forEach(([test, result]) => {
        let status = '❌ FAILED';
        if (result === true) status = '✅ PASSED';
        if (result === 'not-configured') status = '⚠️ NOT CONFIGURED';
        
        console.log(`${status} ${test}`);
    });
    
    const criticalTests = ['envVariables', 'supabaseConnection'];
    const criticalPassed = criticalTests.every(test => results[test] === true);
    
    if (criticalPassed) {
        console.log('\n🎉 Critical tests passed! Your system is working correctly.');
        console.log('📝 Next steps:');
        console.log('1. Test file upload in Ad Resources page');
        console.log('2. Test WhatsApp notifications (if configured)');
        console.log('3. Deploy to production when ready');
    } else {
        console.log('\n⚠️ Some critical tests failed. Check the errors above.');
        console.log('📝 Troubleshooting:');
        console.log('1. Make sure your .env.local file is in the project root');
        console.log('2. Restart your development server after adding env vars');
        console.log('3. Check that all required environment variables are set');
    }
    
    return results;
}

// Auto-run tests
runAllTests();
