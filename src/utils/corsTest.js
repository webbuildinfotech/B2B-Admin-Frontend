// Test CORS connection for admin panel
const testCorsConnection = async () => {
  try {
    const response = await fetch('http://localhost:3000', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    console.log('CORS Test Response:', response.status, response.statusText);
    return true;
  } catch (error) {
    console.error('CORS Test Failed:', error);
    return false;
  }
};

// Run test when page loads
if (typeof window !== 'undefined') {
  testCorsConnection();
}
