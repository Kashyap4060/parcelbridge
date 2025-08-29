#!/usr/bin/env node

// Test script to verify Firebase distance data is working
const { getFeeEstimate } = require('./src/lib/feeCalculation');

async function testFeeCalculation() {
  console.log('🧪 Testing fee calculation with real Firebase data...\n');

  // Test cases with common station codes
  const testCases = [
    { weight: 1.5, from: 'CSMT', to: 'PUNE', description: 'Mumbai CSMT to Pune (1.5kg)' },
    { weight: 3, from: 'NDLS', to: 'BCT', description: 'New Delhi to Mumbai Central (3kg)' },
    { weight: 5.5, from: 'SBC', to: 'MAS', description: 'Bangalore to Chennai Central (5.5kg)' },
    { weight: 2, from: 'HWH', to: 'NDLS', description: 'Howrah to New Delhi (2kg)' }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.description}`);
    console.log(`   Weight: ${testCase.weight}kg | From: ${testCase.from} | To: ${testCase.to}`);
    
    try {
      const result = await getFeeEstimate(testCase.weight, testCase.from, testCase.to);
      
      if (result.success) {
        console.log(`   ✅ Fee: ₹${result.fee}`);
        console.log(`   📏 Distance: ${result.breakdown.distance}km`);
        console.log(`   💰 Base Fee: ₹${result.breakdown.baseFee} | Distance Fee: ₹${result.breakdown.distanceFee}`);
        console.log(`   🏷️  Weight Tier: ${result.breakdown.weightTier.label}`);
      } else {
        console.log(`   ❌ Error: ${result.error}`);
        if (result.requiresManualQuote) {
          console.log(`   📝 Requires manual quote`);
        }
      }
    } catch (error) {
      console.log(`   💥 Exception: ${error.message}`);
    }
  }

  console.log('\n🎯 Test completed!');
}

// Initialize Firebase and run test
const admin = require('firebase-admin');

// Check if already initialized
if (!admin.apps.length) {
  const serviceAccount = require('./firebase-service-account-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

testFeeCalculation().catch(console.error);
