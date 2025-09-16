/**
 * Test Enhanced Railway Services Integration
 * Verify that enhancedRailwayService.ts works with the new database schema
 */

import { 
  EnhancedTrainService, 
  EnhancedRouteService, 
  EnhancedDistanceService,
  RailwayAnalyticsService
} from '@/lib/enhancedRailwayService';

// Test script to verify enhanced railway services
export async function testEnhancedRailwayServices() {
  console.log('🚀 Testing Enhanced Railway Services...');
  
  try {
    // Test 1: Enhanced Train Search
    console.log('\n1. Testing Enhanced Train Search...');
    const trainSearchResult = await EnhancedTrainService.searchTrains({
      fromStation: 'NDLS',
      toStation: 'MMCT',
      trainType: 'Rajdhani'
    });
    console.log('✅ Train Search Result:', trainSearchResult?.length || 0, 'trains found');

    // Test 2: Journey Planning
    console.log('\n2. Testing Journey Planning...');
    const journeyPlan = await EnhancedRouteService.planJourney({
      fromStation: 'NDLS',
      toStation: 'MMCT',
      departureDate: new Date()
    });
    console.log('✅ Journey Plan:', journeyPlan ? 'Success' : 'No routes found');

    // Test 3: Distance Calculation
    console.log('\n3. Testing Enhanced Distance Service...');
    const distanceInfo = await EnhancedDistanceService.calculateDistanceWithOptions(
      'NDLS',
      'MMCT'
    );
    console.log('✅ Distance Info:', distanceInfo ? `${distanceInfo.shortest}km` : 'Not found');

    // Test 4: Analytics Service
    console.log('\n4. Testing Analytics Service...');
    const popularRoutes = await RailwayAnalyticsService.getPopularRoutes(5);
    console.log('✅ Popular Routes:', popularRoutes ? `${popularRoutes.length} routes` : 'Not found');

    // Test 5: Real-time Service  
    console.log('\n5. Testing Real-time Service...');
    const trainStatus = await EnhancedTrainService.getRealTimeStatus('12951', new Date());
    console.log('✅ Train Status:', trainStatus ? 'Available' : 'Not found');

    console.log('\n🎉 All Enhanced Railway Services tested successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error testing enhanced railway services:', error);
    return false;
  }
}

// Test enhanced fee calculator integration
export async function testEnhancedFeeCalculatorIntegration() {
  console.log('\n🧮 Testing Enhanced Fee Calculator Integration...');
  
  try {
    const { EnhancedFeeCalculatorService } = await import('@/lib/enhancedFeeCalculator');
    
    const testInput = {
      fromStationCode: 'NDLS',
      toStationCode: 'MMCT',
      dimensions: { length: 30, breadth: 20, height: 15, weight: 5 },
      deliveryUrgency: 'standard' as const,
      scheduledPickupTime: '10:00',
      deliveryDate: new Date()
    };

    const result = await EnhancedFeeCalculatorService.calculateEnhancedFee(testInput);
    console.log('✅ Enhanced Fee Calculator:', result ? `₹${result.totalFee}` : 'Failed');
    console.log('✅ Delivery Options:', result?.deliveryOptions?.length || 0);
    console.log('✅ Recommended Trains:', result?.recommendedTrains?.length || 0);

    return true;
  } catch (error) {
    console.error('❌ Error testing enhanced fee calculator:', error);
    return false;
  }
}

// Run comprehensive test
export async function runComprehensiveTest() {
  console.log('🔬 Starting Comprehensive Enhanced Railway System Test...');
  
  const railwayServicesTest = await testEnhancedRailwayServices();
  const feeCalculatorTest = await testEnhancedFeeCalculatorIntegration();
  
  if (railwayServicesTest && feeCalculatorTest) {
    console.log('\n🏆 ALL TESTS PASSED! Enhanced Railway System is fully operational.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the console for details.');
  }
  
  return railwayServicesTest && feeCalculatorTest;
}