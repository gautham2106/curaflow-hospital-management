// Test the queue call API locally
const fetch = require('node-fetch');

async function testQueueCallAPI() {
    try {
        console.log('=== TESTING QUEUE CALL API LOCALLY ===');
        
        const baseUrl = 'http://localhost:9002';
        const apiUrl = `${baseUrl}/api/queue/call`;
        
        const requestBody = {
            patientId: '0747bf73-4490-42b8-89ae-aa3a614ac472',
            doctorId: '8bef825b-e6cc-4150-b9a7-0116b0098589',
            reason: 'Test call'
        };
        
        console.log('Testing API URL:', apiUrl);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-clinic-id': '92fc77cd-e5d8-45b5-a359-a3a83692ed9d'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API call successful!');
            console.log('Response data:', JSON.stringify(data, null, 2));
        } else {
            const errorText = await response.text();
            console.log('❌ API call failed!');
            console.log('Error response:', errorText);
        }
        
    } catch (error) {
        console.error('Error testing API:', error.message);
    }
}

// Wait a moment for the dev server to start, then test
setTimeout(testQueueCallAPI, 5000);

