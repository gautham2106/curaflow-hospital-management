// Test Supabase Storage Connection
// Run this in your browser console to test the storage setup

console.log('🧪 Testing Supabase Storage Connection...');

// Test 1: Check if storage bucket exists
async function testStorageBucket() {
    try {
        console.log('📦 Testing storage bucket access...');
        
        // This will be available in your app context
        if (typeof window !== 'undefined' && window.supabase) {
            const { data, error } = await window.supabase.storage
                .from('ad-resources')
                .list('', { limit: 1 });
            
            if (error) {
                console.error('❌ Storage bucket test failed:', error);
                return false;
            }
            
            console.log('✅ Storage bucket accessible:', data);
            return true;
        } else {
            console.log('⚠️ Supabase client not available in this context');
            return false;
        }
    } catch (error) {
        console.error('❌ Storage test error:', error);
        return false;
    }
}

// Test 2: Check if our storage service is available
function testStorageService() {
    console.log('🔧 Testing storage service availability...');
    
    // Check if the storage service class exists
    if (typeof SupabaseStorageService !== 'undefined') {
        console.log('✅ SupabaseStorageService is available');
        
        // Test validation
        const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const validation = SupabaseStorageService.validateFile(testFile);
        console.log('✅ File validation works:', validation);
        
        return true;
    } else {
        console.log('❌ SupabaseStorageService not found');
        return false;
    }
}

// Test 3: Check ad resources API
async function testAdResourcesAPI() {
    try {
        console.log('🌐 Testing ad resources API...');
        
        const clinicId = sessionStorage.getItem('clinicId');
        if (!clinicId) {
            console.log('⚠️ No clinic ID found in session storage');
            return false;
        }
        
        const response = await fetch('/api/ad-resources', {
            headers: {
                'x-clinic-id': clinicId
            }
        });
        
        if (!response.ok) {
            console.error('❌ API test failed:', response.status, response.statusText);
            return false;
        }
        
        const data = await response.json();
        console.log('✅ Ad resources API working:', data);
        return true;
    } catch (error) {
        console.error('❌ API test error:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting comprehensive storage tests...\n');
    
    const results = {
        storageBucket: await testStorageBucket(),
        storageService: testStorageService(),
        adResourcesAPI: await testAdResourcesAPI()
    };
    
    console.log('\n📊 Test Results:');
    console.log('================');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(Boolean);
    
    if (allPassed) {
        console.log('\n🎉 All tests passed! Your storage setup is working correctly.');
        console.log('📝 Next steps:');
        console.log('1. Go to Ad Resources page in your app');
        console.log('2. Click "Add New Resource"');
        console.log('3. Select an image or video file');
        console.log('4. Watch for upload progress indicator');
        console.log('5. Verify file appears in your resources list');
    } else {
        console.log('\n⚠️ Some tests failed. Check the errors above.');
        console.log('📝 Troubleshooting:');
        console.log('1. Make sure you ran the SUPABASE-STORAGE-SETUP.sql');
        console.log('2. Check that your Supabase project is active');
        console.log('3. Verify your environment variables are set');
        console.log('4. Make sure you are logged in to a clinic');
    }
    
    return results;
}

// Auto-run tests
runAllTests();
