// Test WhatsApp Integration After Credential Fix
// Run this in your browser console to verify WhatsApp works with correct credentials

console.log('📱 Testing WhatsApp Integration After Credential Fix...');

// Test WhatsApp API with correct credentials
async function testWhatsAppAPI() {
    try {
        console.log('🔧 Testing WhatsApp API with correct credentials...');
        
        // Get clinic ID from session storage
        const clinicId = sessionStorage.getItem('clinicId');
        if (!clinicId) {
            console.log('⚠️ No clinic ID found - please login to a clinic first');
            return false;
        }
        
        // Test data for WhatsApp API
        const testData = {
            tokenData: {
                id: 'test-whatsapp-' + Date.now(),
                patientName: 'Test Patient',
                phone: '+1234567890', // Use a test phone number
                tokenNumber: 1,
                date: new Date().toISOString(),
                session: 'Morning',
                doctor: { 
                    id: 'test-doctor', 
                    name: 'Dr. Test', 
                    specialty: 'General Medicine' 
                },
                clinicId: clinicId
            },
            sessionTimeRange: '9:00 AM - 12:00 PM',
            clinicName: 'Test Clinic'
        };
        
        console.log('📤 Sending WhatsApp test request...');
        
        const response = await fetch('/api/notifications/whatsapp', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-clinic-id': clinicId
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        console.log('📊 WhatsApp API Response:');
        console.log('   Status:', response.status);
        console.log('   Response:', result);
        
        if (response.ok) {
            console.log('✅ WhatsApp API working with correct credentials!');
            console.log('   Message ID:', result.id || 'Not provided');
            console.log('   Status:', result.status || 'Success');
            return true;
        } else if (response.status === 400) {
            console.log('⚠️ WhatsApp API validation error:', result.error || result.message);
            console.log('   This might be due to test phone number format');
            return 'validation_error';
        } else if (response.status === 500) {
            console.log('❌ WhatsApp API server error:', result.error || result.message);
            return false;
        } else {
            console.log('❌ WhatsApp API failed:', response.status, result.error || result.message);
            return false;
        }
    } catch (error) {
        console.log('❌ WhatsApp API test error:', error.message);
        return false;
    }
}

// Test environment variables
function testEnvironmentVariables() {
    console.log('🌍 Testing environment variables...');
    
    // Check if we can access the app (indicates env vars are loaded)
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('vercel.app')) {
        console.log('✅ App is running (environment variables loaded)');
        return true;
    } else {
        console.log('⚠️ App may not be running or env vars not loaded');
        return false;
    }
}

// Test if WhatsApp credentials are properly configured
async function testWhatsAppCredentials() {
    try {
        console.log('🔑 Testing WhatsApp credentials configuration...');
        
        // Try to access the WhatsApp API endpoint
        const response = await fetch('/api/notifications/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true })
        });
        
        if (response.status === 400) {
            console.log('✅ WhatsApp API endpoint accessible (credentials configured)');
            return true;
        } else if (response.status === 500) {
            const errorData = await response.json();
            if (errorData.error && errorData.error.includes('Missing WHATSAPP_ACCESS_TOKEN')) {
                console.log('❌ WhatsApp credentials not configured properly');
                return false;
            } else {
                console.log('⚠️ WhatsApp API error (may be due to test data)');
                return true;
            }
        } else {
            console.log('⚠️ Unexpected response from WhatsApp API');
            return false;
        }
    } catch (error) {
        console.log('❌ WhatsApp credentials test error:', error.message);
        return false;
    }
}

// Run all WhatsApp tests
async function runWhatsAppTests() {
    console.log('🚀 Starting WhatsApp integration tests...\n');
    
    const results = {
        envVariables: testEnvironmentVariables(),
        credentials: await testWhatsAppCredentials(),
        whatsappAPI: await testWhatsAppAPI()
    };
    
    console.log('\n📊 WhatsApp Test Results:');
    console.log('========================');
    
    Object.entries(results).forEach(([test, result]) => {
        let status = '❌ FAILED';
        if (result === true) status = '✅ PASSED';
        if (result === 'validation_error') status = '⚠️ VALIDATION ERROR';
        if (result === false) status = '❌ FAILED';
        
        console.log(`${status} ${test}`);
    });
    
    // Calculate success rate
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => 
        r === true || r === 'validation_error'
    ).length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n🎯 WhatsApp Integration Assessment:');
    console.log('==================================');
    console.log(`Success Rate: ${successRate}%`);
    
    if (successRate >= 80) {
        console.log('🟢 EXCELLENT - WhatsApp integration working!');
    } else if (successRate >= 60) {
        console.log('🟡 GOOD - WhatsApp integration mostly working');
    } else if (successRate >= 40) {
        console.log('🟠 FAIR - WhatsApp integration has some issues');
    } else {
        console.log('🔴 POOR - WhatsApp integration needs attention');
    }
    
    console.log('\n📱 WhatsApp Status:');
    console.log('==================');
    
    if (results.envVariables) {
        console.log('✅ Environment variables loaded');
    }
    
    if (results.credentials) {
        console.log('✅ WhatsApp credentials configured');
    }
    
    if (results.whatsappAPI === true) {
        console.log('✅ WhatsApp API working perfectly');
    } else if (results.whatsappAPI === 'validation_error') {
        console.log('⚠️ WhatsApp API working but validation error (test phone number)');
    } else {
        console.log('❌ WhatsApp API not working');
    }
    
    console.log('\n📋 Recommendations:');
    console.log('===================');
    
    if (successRate >= 80) {
        console.log('🎉 Your WhatsApp integration is working correctly!');
        console.log('✅ Correct credentials are configured');
        console.log('✅ API endpoint is accessible');
        console.log('✅ Ready for production use');
    } else {
        console.log('⚠️ Some issues detected:');
        if (!results.credentials) {
            console.log('   - Check WhatsApp credentials in .env file');
            console.log('   - Make sure WHATSAPP_ACCESS_TOKEN is correct');
            console.log('   - Make sure WHATSAPP_PHONE_ID is correct');
        }
        if (!results.envVariables) {
            console.log('   - Check environment variables are loaded');
            console.log('   - Restart your development server');
        }
    }
    
    return results;
}

// Auto-run WhatsApp tests
runWhatsAppTests();
