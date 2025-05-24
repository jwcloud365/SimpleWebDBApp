// Simple test to verify detail page functionality
const http = require('http');

// Test 1: Check if detail page loads correctly
function testDetailPageLoad() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/pictures/48',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                const hasEditBtn = data.includes('id="editBtn"');
                const hasDeleteBtn = data.includes('id="deleteBtn"');
                const hasJsFile = data.includes('detail-clean.js');
                
                console.log('✅ Detail page load test:');
                console.log('  - Edit button present:', hasEditBtn);
                console.log('  - Delete button present:', hasDeleteBtn);
                console.log('  - JavaScript file included:', hasJsFile);
                console.log('  - Status code:', res.statusCode);
                
                resolve({
                    success: res.statusCode === 200 && hasEditBtn && hasDeleteBtn && hasJsFile,
                    details: { hasEditBtn, hasDeleteBtn, hasJsFile, statusCode: res.statusCode }
                });
            });
        });

        req.on('error', (err) => {
            console.error('❌ Error testing detail page:', err.message);
            reject(err);
        });

        req.end();
    });
}

// Test 2: Check if JavaScript file loads correctly
function testJavaScriptFile() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/js/detail-clean.js',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                const hasEventListeners = data.includes('addEventListener');
                const hasDeleteFunction = data.includes('DELETE');
                const hasConsoleLog = data.includes('[DETAIL]');
                
                console.log('✅ JavaScript file test:');
                console.log('  - Contains event listeners:', hasEventListeners);
                console.log('  - Contains delete functionality:', hasDeleteFunction);
                console.log('  - Contains logging:', hasConsoleLog);
                console.log('  - Status code:', res.statusCode);
                console.log('  - File size:', data.length, 'bytes');
                
                resolve({
                    success: res.statusCode === 200 && hasEventListeners && hasDeleteFunction,
                    details: { hasEventListeners, hasDeleteFunction, hasConsoleLog, statusCode: res.statusCode, size: data.length }
                });
            });
        });

        req.on('error', (err) => {
            console.error('❌ Error testing JavaScript file:', err.message);
            reject(err);
        });

        req.end();
    });
}

// Run tests
async function runTests() {
    console.log('🧪 Testing Detail Page Functionality...\n');
    
    try {
        const detailPageTest = await testDetailPageLoad();
        const jsFileTest = await testJavaScriptFile();
        
        console.log('\n📋 Summary:');
        console.log('Detail page loading:', detailPageTest.success ? '✅ PASS' : '❌ FAIL');
        console.log('JavaScript file loading:', jsFileTest.success ? '✅ PASS' : '❌ FAIL');
        
        const allTestsPass = detailPageTest.success && jsFileTest.success;
        console.log('\n🎯 Overall status:', allTestsPass ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED');
        
        if (allTestsPass) {
            console.log('\n🚀 The detail page should be working correctly!');
            console.log('   - Edit button should show an alert when clicked');
            console.log('   - Delete button should show confirmation and delete the picture');
            console.log('   - All interactions should be logged to browser console');
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
    }
}

runTests();
