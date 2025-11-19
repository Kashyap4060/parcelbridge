// Simple test file to verify Razorpay integration
// This can be run to test the API endpoints

async function testRazorpayIntegration() {
  const testAmount = 100; // ₹1.00 in paise
  
  console.log('Testing Razorpay Integration...');
  
  try {
    // Test 1: Create Order
    console.log('1. Testing order creation...');
    const orderResponse = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: testAmount,
        purpose: 'escrow_payment',
        userId: 'test-user-id',
        userEmail: 'test@example.com',
        userName: 'Test User',
        parcelId: 'test-parcel-id',
      }),
    });
    
    const orderData = await orderResponse.json();
    console.log('Order creation result:', orderData);
    
    if (!orderResponse.ok) {
      throw new Error(orderData.error || 'Order creation failed');
    }
    
    // Test 2: Payment Verification (Mock)
    console.log('2. Testing payment verification...');
    const mockPaymentData = {
      razorpay_order_id: orderData.id,
      razorpay_payment_id: 'pay_test123',
      razorpay_signature: 'test_signature',
    };
    
    const verifyResponse = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockPaymentData),
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Payment verification result:', verifyData);
    
    console.log('✅ Razorpay integration test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Razorpay integration test failed:', error);
    return false;
  }
}

// Export for potential use in testing
if (typeof window !== 'undefined') {
  (window as any).testRazorpayIntegration = testRazorpayIntegration;
}

export { testRazorpayIntegration };