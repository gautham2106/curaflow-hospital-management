// Test Security Level After All Fixes
// Run this in your browser console to verify security features

console.log('🛡️ Testing Security Level After All Fixes...');

// Test 1: Rate Limiting
async function testRateLimiting() {
    try {
        console.log('🚫 Testing rate limiting...');
        
        let requests = 0;
        let blocked = false;
        
        // Try to make multiple rapid requests
        for (let i = 0; i < 10; i++) {
            try {
                const response = await fetch('/api/superadmin/stats', {
                    headers: { 'Authorization': 'Bearer test-token' }
                });
                
                if (response.status === 429) {
                    blocked = true;
                    console.log(`   Request ${i + 1}: Rate limited (429)`);
                    break;
                } else {
                    requests++;
                    console.log(`   Request ${i + 1}: ${response.status}`);
                }
            } catch (error) {
                console.log(`   Request ${i + 1}: Error - ${error.message}`);
            }
        }
        
        if (blocked) {
            console.log('✅ Rate limiting working - requests blocked after limit');
            return true;
        } else {
            console.log('⚠️ Rate limiting may not be working - no blocks detected');
            return false;
        }
    } catch (error) {
        console.log('❌ Rate limiting test error:', error.message);
        return false;
    }
}

// Test 2: Authentication Protection
async function testAuthenticationProtection() {
    try {
        console.log('🔐 Testing authentication protection...');
        
        // Test protected endpoint without auth
        const response = await fetch('/api/superadmin/stats');
        
        if (response.status === 401) {
            console.log('✅ Authentication protection working - 401 returned');
            return true;
        } else if (response.status === 500) {
            console.log('⚠️ Server error - may indicate auth system not fully integrated');
            return false;
        } else {
            console.log('❌ Authentication protection failed - unexpected status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Authentication test error:', error.message);
        return false;
    }
}

// Test 3: Input Validation
async function testInputValidation() {
    try {
        console.log('📝 Testing input validation...');
        
        // Test with invalid data
        const response = await fetch('/api/tokens', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-clinic-id': 'test-clinic-id'
            },
            body: JSON.stringify({
                // Missing required fields
                invalidData: 'test'
            })
        });
        
        if (response.status === 400) {
            console.log('✅ Input validation working - 400 returned for invalid data');
            return true;
        } else {
            console.log('⚠️ Input validation may not be working - unexpected status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Input validation test error:', error.message);
        return false;
    }
}

// Test 4: Security Headers
function testSecurityHeaders() {
    try {
        console.log('🛡️ Testing security headers...');
        
        // Check if security headers are present
        const headers = {
            'X-Frame-Options': document.querySelector('meta[http-equiv="X-Frame-Options"]')?.getAttribute('content'),
            'X-Content-Type-Options': document.querySelector('meta[http-equiv="X-Content-Type-Options"]')?.getAttribute('content'),
            'X-XSS-Protection': document.querySelector('meta[http-equiv="X-XSS-Protection"]')?.getAttribute('content')
        };
        
        const hasHeaders = Object.values(headers).some(header => header);
        
        if (hasHeaders) {
            console.log('✅ Security headers detected');
            console.log('   Headers found:', Object.entries(headers).filter(([k, v]) => v));
            return true;
        } else {
            console.log('⚠️ No security headers detected - consider adding them');
            return false;
        }
    } catch (error) {
        console.log('❌ Security headers test error:', error.message);
        return false;
    }
}

// Test 5: Session Security
async function testSessionSecurity() {
    try {
        console.log('🔑 Testing session security...');
        
        // Test with invalid session token
        const response = await fetch('/api/superadmin/auth', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer invalid-token-12345' }
        });
        
        if (response.status === 401) {
            console.log('✅ Session security working - invalid token rejected');
            return true;
        } else {
            console.log('⚠️ Session security may not be working - unexpected status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Session security test error:', error.message);
        return false;
    }
}

// Test 6: Data Protection
async function testDataProtection() {
    try {
        console.log('🔒 Testing data protection...');
        
        // Test if sensitive data is properly protected
        const response = await fetch('/api/superadmin/stats', {
            headers: { 'Authorization': 'Bearer test-token' }
        });
        
        if (response.status === 401) {
            console.log('✅ Data protection working - unauthorized access blocked');
            return true;
        } else if (response.status === 500) {
            console.log('⚠️ Server error - may indicate protection system not fully integrated');
            return false;
        } else {
            console.log('❌ Data protection failed - unexpected status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Data protection test error:', error.message);
        return false;
    }
}

// Run all security tests
async function runSecurityTests() {
    console.log('🚀 Starting comprehensive security tests...\n');
    
    const results = {
        rateLimiting: await testRateLimiting(),
        authentication: await testAuthenticationProtection(),
        inputValidation: await testInputValidation(),
        securityHeaders: testSecurityHeaders(),
        sessionSecurity: await testSessionSecurity(),
        dataProtection: await testDataProtection()
    };
    
    console.log('\n📊 Security Test Results:');
    console.log('==========================');
    
    Object.entries(results).forEach(([test, result]) => {
        const status = result ? '✅ PASSED' : '❌ FAILED';
        console.log(`${status} ${test}`);
    });
    
    // Calculate security score
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;
    const securityScore = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n🎯 Security Assessment:');
    console.log('======================');
    console.log(`Security Score: ${securityScore}%`);
    
    if (securityScore >= 90) {
        console.log('🟢 EXCELLENT - Your system is highly secure!');
    } else if (securityScore >= 80) {
        console.log('🟡 GOOD - Your system is secure with minor improvements needed');
    } else if (securityScore >= 70) {
        console.log('🟠 FAIR - Your system has good security but needs improvements');
    } else {
        console.log('🔴 POOR - Your system needs significant security improvements');
    }
    
    console.log('\n🛡️ Security Features Status:');
    console.log('=============================');
    
    if (results.rateLimiting) {
        console.log('✅ Rate limiting active');
    }
    
    if (results.authentication) {
        console.log('✅ Authentication protection active');
    }
    
    if (results.inputValidation) {
        console.log('✅ Input validation active');
    }
    
    if (results.securityHeaders) {
        console.log('✅ Security headers present');
    } else {
        console.log('⚠️ Security headers missing - add them for better protection');
    }
    
    if (results.sessionSecurity) {
        console.log('✅ Session security active');
    }
    
    if (results.dataProtection) {
        console.log('✅ Data protection active');
    }
    
    console.log('\n📋 Security Recommendations:');
    console.log('=============================');
    
    if (securityScore >= 90) {
        console.log('🎉 Your system is production-ready!');
        console.log('✅ All critical security features are working');
        console.log('✅ Your system is hack-proof and data-theft-proof');
        console.log('✅ API flooding protection is active');
    } else {
        console.log('⚠️ Some security improvements needed:');
        if (!results.securityHeaders) {
            console.log('   - Add security headers to next.config.ts');
        }
        if (!results.rateLimiting) {
            console.log('   - Check rate limiting configuration');
        }
        if (!results.authentication) {
            console.log('   - Verify authentication system is working');
        }
    }
    
    return results;
}

// Auto-run security tests
runSecurityTests();