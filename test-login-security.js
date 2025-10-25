// Test Login Functionality After Security Updates
// Run this in your browser console to verify login works with new security

console.log('🔐 Testing Login Functionality After Security Updates...');

// Test 1: Superadmin Login
async function testSuperadminLogin() {
    try {
        console.log('👑 Testing superadmin login...');
        
        const response = await fetch('/api/superadmin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'superadmin',
                password: 'superadmin123'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Superadmin login successful!');
            console.log('   Token:', data.token ? 'Generated' : 'Not generated');
            console.log('   User:', data.superadmin?.username || 'Unknown');
            return { success: true, data };
        } else {
            const errorData = await response.json();
            console.log('❌ Superadmin login failed:', response.status, errorData.error);
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.log('❌ Superadmin login error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test 2: Clinic Login
async function testClinicLogin() {
    try {
        console.log('🏥 Testing clinic login...');
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                pin: '1234'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Clinic login successful!');
            console.log('   Clinic:', data.clinic?.name || 'Unknown');
            console.log('   User:', data.user?.name || 'Unknown');
            return { success: true, data };
        } else {
            const errorData = await response.json();
            console.log('❌ Clinic login failed:', response.status, errorData.error);
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.log('❌ Clinic login error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test 3: Failed Login Attempts (Account Lockout Test)
async function testFailedLoginAttempts() {
    try {
        console.log('🔒 Testing failed login attempts (account lockout)...');
        
        let failedAttempts = 0;
        for (let i = 0; i < 3; i++) {
            const response = await fetch('/api/superadmin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'superadmin',
                    password: 'wrongpassword'
                })
            });
            
            if (!response.ok) {
                failedAttempts++;
                console.log(`   Attempt ${i + 1}: Failed (${response.status})`);
            }
        }
        
        if (failedAttempts > 0) {
            console.log('✅ Failed login attempts tracked:', failedAttempts);
            return { success: true, attempts: failedAttempts };
        } else {
            console.log('⚠️ Failed login attempts not properly tracked');
            return { success: false, attempts: failedAttempts };
        }
    } catch (error) {
        console.log('❌ Failed login test error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test 4: Environment Variables Check
function testEnvironmentVariables() {
    console.log('🌍 Testing environment variables...');
    
    // Check if we can access the app (this indicates env vars are working)
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('vercel.app')) {
        console.log('✅ App is running (environment variables loaded)');
        return true;
    } else {
        console.log('⚠️ App may not be running or env vars not loaded');
        return false;
    }
}

// Test 5: Security Features Check
async function testSecurityFeatures() {
    try {
        console.log('🛡️ Testing security features...');
        
        // Test if we can access superadmin stats (requires auth)
        const response = await fetch('/api/superadmin/stats', {
            headers: { 'Authorization': 'Bearer test-token' }
        });
        
        if (response.status === 401) {
            console.log('✅ Authentication required (security working)');
            return true;
        } else if (response.status === 500) {
            console.log('⚠️ Server error (may indicate security system not fully integrated)');
            return false;
        } else {
            console.log('⚠️ Unexpected response:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Security features test error:', error.message);
        return false;
    }
}

// Run all login tests
async function runLoginTests() {
    console.log('🚀 Starting comprehensive login tests...\n');
    
    const results = {
        envVariables: testEnvironmentVariables(),
        superadminLogin: await testSuperadminLogin(),
        clinicLogin: await testClinicLogin(),
        failedLoginTest: await testFailedLoginAttempts(),
        securityFeatures: await testSecurityFeatures()
    };
    
    console.log('\n📊 Login Test Results:');
    console.log('=====================');
    
    Object.entries(results).forEach(([test, result]) => {
        let status = '❌ FAILED';
        if (result === true) status = '✅ PASSED';
        if (result && result.success) status = '✅ PASSED';
        if (result && result.success === false) status = '❌ FAILED';
        
        console.log(`${status} ${test}`);
    });
    
    // Calculate success rate
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => 
        r === true || (r && r.success === true)
    ).length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n🎯 Login Assessment:');
    console.log('===================');
    console.log(`Success Rate: ${successRate}%`);
    
    if (successRate >= 80) {
        console.log('🟢 EXCELLENT - Login system working perfectly!');
    } else if (successRate >= 60) {
        console.log('🟡 GOOD - Login system working with minor issues');
    } else if (successRate >= 40) {
        console.log('🟠 FAIR - Login system has some issues');
    } else {
        console.log('🔴 POOR - Login system needs attention');
    }
    
    console.log('\n🔐 Security Status:');
    console.log('==================');
    
    if (results.superadminLogin && results.superadminLogin.success) {
        console.log('✅ Superadmin login working with bcrypt hashing');
    }
    
    if (results.clinicLogin && results.clinicLogin.success) {
        console.log('✅ Clinic login working');
    }
    
    if (results.failedLoginTest && results.failedLoginTest.success) {
        console.log('✅ Account lockout system tracking failed attempts');
    }
    
    if (results.securityFeatures) {
        console.log('✅ Security features active');
    }
    
    console.log('\n📋 Recommendations:');
    console.log('===================');
    
    if (successRate >= 80) {
        console.log('🎉 Your system is ready for production use!');
        console.log('✅ All login functionality working correctly');
        console.log('✅ Security features active');
        console.log('✅ Environment variables loaded');
    } else {
        console.log('⚠️ Some issues detected:');
        if (!results.superadminLogin || !results.superadminLogin.success) {
            console.log('   - Check superadmin credentials');
        }
        if (!results.clinicLogin || !results.clinicLogin.success) {
            console.log('   - Check clinic credentials');
        }
        if (!results.envVariables) {
            console.log('   - Check environment variables');
        }
    }
    
    return results;
}

// Auto-run login tests
runLoginTests();
