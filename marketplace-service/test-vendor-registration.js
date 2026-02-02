// Test script for Vendor Registration endpoint
// Run: node test-vendor-registration.js

const axios = require('axios');

const API_BASE = 'http://localhost:3002';
const AUTH_BASE = 'http://localhost:3001';

// Test credentials (replace with actual test user)
const TEST_USER = {
    email: 'mkhan223754@bscse.uiu.ac.bd',
    password: 'Nintendo11!'
};

async function testVendorRegistration() {
    console.log('🧪 Testing Vendor Registration Endpoint\n');

    try {
        // Step 1: Login to get JWT token
        console.log('Step 1: Logging in...');
        const loginResponse = await axios.post(`${AUTH_BASE}/login`, TEST_USER);
        const token = loginResponse.data.token;
        console.log('✅ Login successful\n');

        // Step 2: Test vendor registration
        console.log('Step 2: Registering new vendor...');
        const vendorData = {
            name: 'Test Tech Startup',
            description: 'A student-led tech innovation hub',
            type: 'STARTUP'
        };

        const registerResponse = await axios.post(
            `${API_BASE}/vendors/register`,
            vendorData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Vendor registration successful!');
        console.log('Response:', JSON.stringify(registerResponse.data, null, 2));
        console.log('\n📝 Vendor ID:', registerResponse.data.vendorId);

        // Step 3: Try to register again (should fail - one shop per user)
        console.log('\nStep 3: Testing one-shop-per-user rule...');
        try {
            await axios.post(
                `${API_BASE}/vendors/register`,
                {
                    name: 'Second Shop',
                    description: 'This should fail',
                    type: 'FOOD_VENDOR'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('❌ Test failed: Should not allow second shop');
        } catch (error) {
            if (error.response?.status === 409) {
                console.log('✅ One-shop-per-user rule working correctly');
                console.log('Error message:', error.response.data.error);
            } else {
                throw error;
            }
        }

        // Step 4: Test without authentication
        console.log('\nStep 4: Testing without authentication...');
        try {
            await axios.post(`${API_BASE}/vendors/register`, vendorData);
            console.log('❌ Test failed: Should require authentication');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Authentication requirement working correctly');
            } else {
                throw error;
            }
        }

        console.log('\n🎉 All tests passed!');

    } catch (error) {
        console.error('\n❌ Test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('\n💡 Troubleshooting:');
            if (error.response.status === 401) {
                console.error('- Check if JWT_SECRET matches between auth-service and marketplace-service');
                console.error('- Auth service JWT_SECRET:', process.env.JWT_SECRET || 'Not set');
                console.error('- Verify auth-service is running on port 3001');
            }
        } else {
            console.error(error.message);
            console.error('\n💡 Is the service running? Check:');
            console.error('- Auth service: http://localhost:3001/health');
            console.error('- Marketplace service: http://localhost:3002/');
        }
        process.exit(1);
    }
}

// Run tests
testVendorRegistration();
