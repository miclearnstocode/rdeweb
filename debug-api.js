// debug-api.js
const endpoints = [
    '/sessionCheck',
    '/loginAuth',
    '/loader',
    '/loadercos',
    '/uploadResearchFile',
    '/evaluatorReg',
    '/getresearch',
    '/filesSend',
    '/inboxFile',
    '/approval'
];

async function testEndpoint(endpoint) {
    try {
        console.log(`\n🔍 Testing: ${endpoint}`);
        
        const formData = new FormData();
        formData.append('test', 'test');
        
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        
        const text = await response.text();
        const isHtml = text.includes('<!DOCTYPE') || text.includes('<html');
        
        if (isHtml) {
            console.error(`❌ ${endpoint} returns HTML!`);
            console.log('Preview:', text.substring(0, 150));
        } else {
            console.log(`✅ ${endpoint} returns non-HTML`);
            console.log('Type:', response.headers.get('content-type'));
            console.log('Length:', text.length, 'chars');
        }
        
        return { endpoint, isHtml };
    } catch (error) {
        console.error(`💥 ${endpoint} error:`, error.message);
        return { endpoint, error: error.message };
    }
}

async function testAllEndpoints() {
    console.log('🚀 Starting API endpoint tests...');
    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
    }
    
    console.log('\n📊 SUMMARY:');
    const htmlEndpoints = results.filter(r => r.isHtml);
    if (htmlEndpoints.length > 0) {
        console.error('❌ Endpoints returning HTML:');
        htmlEndpoints.forEach(e => console.error(`  - ${e.endpoint}`));
    } else {
        console.log('✅ All endpoints return non-HTML');
    }
}

// Run tests
testAllEndpoints();