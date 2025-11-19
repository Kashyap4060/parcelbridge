/**
 * Enhanced Test Distance Calculation
 * Debug script to test the distance calculation between LTT and NCB using Railway MCP
 */

import { getStationDistance } from './stationService';
import { RailwayMCPService } from './railwayMCPService';

export async function testDistanceCalculation() {
  console.log('🧪 Testing Enhanced Distance Calculation for LTT ↔ NCB');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Direct Railway MCP API
    console.log('\n🚂 Phase 1: Testing Railway MCP API directly');
    console.log('-'.repeat(40));
    try {
      const mcpDistance = await RailwayMCPService.getAccurateDistance('LTT', 'NCB');
      console.log(`Railway MCP Result: ${mcpDistance || 'null'} km`);
    } catch (mcpError) {
      console.log(`Railway MCP Error: ${mcpError}`);
    }
    
    // Test 2: Enhanced station service (with fallback chain)
    console.log('\n📍 Phase 2: Testing Enhanced Station Service');
    console.log('-'.repeat(40));
    
    // Test LTT to NCB
    console.log('\n📍 Testing: LTT → NCB');
    const distance1 = await getStationDistance('LTT', 'NCB');
    console.log(`Result: ${distance1} km`);
    
    // Test NCB to LTT  
    console.log('\n📍 Testing: NCB → LTT');
    const distance2 = await getStationDistance('NCB', 'LTT');
    console.log(`Result: ${distance2} km`);
    
    // Test 3: Performance comparison
    console.log('\n⚡ Phase 3: Performance Testing');
    console.log('-'.repeat(40));
    
    const startTime = Date.now();
    await getStationDistance('LTT', 'NCB');
    const firstCallTime = Date.now() - startTime;
    
    const startTime2 = Date.now();
    await getStationDistance('LTT', 'NCB'); // Should use cache
    const secondCallTime = Date.now() - startTime2;
    
    console.log(`First call: ${firstCallTime}ms`);
    console.log(`Second call (cached): ${secondCallTime}ms`);
    console.log(`Cache speedup: ${Math.round(firstCallTime / secondCallTime)}x faster`);
    
    // Expected result validation
    console.log('\n🎯 Validation Results');
    console.log('-'.repeat(40));
    console.log(`Expected: 2280 km (from manual query)`);
    console.log(`Actual: ${distance1} km`);
    
    // Success criteria
    const isCorrect = distance1 === 2280;
    const isReasonable = distance1 && distance1 > 2000 && distance1 < 3000; // Within reasonable range
    
    if (isCorrect) {
      console.log('✅ PERFECT: Distance calculation is exactly correct!');
      return 'PERFECT';
    } else if (isReasonable) {
      console.log('🟡 CLOSE: Distance is in reasonable range but not exact');
      return 'CLOSE';
    } else {
      console.log('❌ FAILED: Distance calculation is significantly off');
      return 'FAILED';
    }
    
  } catch (error) {
    console.error('❌ Error in distance calculation test:', error);
    return 'ERROR';
  }
}

/**
 * Test multiple station pairs for comprehensive validation
 */
export async function testMultipleStationPairs() {
  console.log('\n🧪 Testing Multiple Station Pairs');
  console.log('='.repeat(60));
  
  const testPairs = [
    { from: 'LTT', to: 'NCB', expected: 2280, description: 'Lokmanya Tilak Terminus → New Cooch Behar' },
    { from: 'NDLS', to: 'BCT', expected: 1384, description: 'New Delhi → Mumbai Central' },
    { from: 'NDLS', to: 'MAA', expected: 1759, description: 'New Delhi → Chennai' },
    { from: 'BCT', to: 'MAA', expected: 1279, description: 'Mumbai Central → Chennai' }
  ];
  
  const results = [];
  
  for (const pair of testPairs) {
    console.log(`\n📍 Testing: ${pair.description}`);
    console.log(`Expected: ${pair.expected} km`);
    
    try {
      const distance = await getStationDistance(pair.from, pair.to);
      console.log(`Actual: ${distance} km`);
      
      const accuracy = distance ? Math.abs(distance - pair.expected) / pair.expected : 1;
      const status = accuracy < 0.05 ? 'EXCELLENT' : 
                   accuracy < 0.1 ? 'GOOD' : 
                   accuracy < 0.2 ? 'FAIR' : 'POOR';
      
      console.log(`Accuracy: ${status} (${(100 - accuracy * 100).toFixed(1)}%)`);
      
      results.push({
        pair: `${pair.from}-${pair.to}`,
        expected: pair.expected,
        actual: distance,
        status
      });
    } catch (error) {
      console.error(`Error testing ${pair.from}-${pair.to}:`, error);
      results.push({
        pair: `${pair.from}-${pair.to}`,
        expected: pair.expected,
        actual: null,
        status: 'ERROR'
      });
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('-'.repeat(60));
  results.forEach(result => {
    console.log(`${result.pair}: ${result.status} (${result.actual}km vs ${result.expected}km expected)`);
  });
  
  const successCount = results.filter(r => ['EXCELLENT', 'GOOD'].includes(r.status)).length;
  console.log(`\n✅ Success Rate: ${successCount}/${results.length} (${Math.round(successCount/results.length*100)}%)`);
  
  return results;
}

// Auto-run if this file is executed directly
if (typeof window === 'undefined') {
  testDistanceCalculation().then(result => {
    console.log(`\n🏁 Primary Test completed: ${result}`);
    
    // Run comprehensive test
    return testMultipleStationPairs();
  }).then(results => {
    console.log('\n🏁 All tests completed');
  }).catch(error => {
    console.error('\n💥 Test execution failed:', error);
  });
}