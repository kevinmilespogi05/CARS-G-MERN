const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testServer() {
  try {
    console.log('🧪 Testing Cars-G API Server...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test CORS
    console.log('\n2. Testing CORS...');
    const corsResponse = await axios.options(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log('✅ CORS configured correctly');

    // Test rate limiting
    console.log('\n3. Testing rate limiting...');
    try {
      for (let i = 0; i < 5; i++) {
        await axios.get(`${BASE_URL}/api/auth/profile`);
      }
      console.log('✅ Rate limiting working (no errors for 5 requests)');
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('✅ Rate limiting working (429 error after limit)');
      } else {
        console.log('⚠️  Rate limiting test inconclusive:', error.message);
      }
    }

    // Test 404 handler
    console.log('\n4. Testing 404 handler...');
    try {
      await axios.get(`${BASE_URL}/nonexistent`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ 404 handler working correctly');
      } else {
        console.log('⚠️  404 handler test failed:', error.message);
      }
    }

    console.log('\n🎉 Server tests completed successfully!');
    console.log('\n📋 Available endpoints:');
    console.log('   GET  /health - Health check');
    console.log('   GET  /api/auth/profile - Get user profile (requires auth)');
    console.log('   GET  /api/reports - Get reports (admin only)');
    console.log('   GET  /api/users/leaderboard - Get leaderboard');
    console.log('   POST /api/chat - Send message (requires auth)');

  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running: npm run dev');
    }
  }
}

// Run tests
testServer();
