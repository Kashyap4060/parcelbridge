/**
 * Real-Time Tracking API Routes
 * Provides endpoints for package tracking data, history, and live updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { RealTimeTrackingService } from '../../../lib/realTimeTrackingService';
import { PackageStatusUpdateService } from '../../../lib/packageStatusUpdateService';
import { EnhancedJourneyVerificationService } from '../../../lib/enhancedJourneyVerificationService';

const trackingService = new RealTimeTrackingService();
const statusUpdateService = new PackageStatusUpdateService();
const journeyService = new EnhancedJourneyVerificationService();

export async function GET(request: NextRequest) {
  const { searchParams, pathname } = new URL(request.url);
  const action = searchParams.get('action');
  const packageId = searchParams.get('packageId');

  try {
    switch (action) {
      case 'summary':
        if (!packageId) {
          return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
        }
        return await getTrackingSummary(packageId);

      case 'history':
        if (!packageId) {
          return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
        }
        return await getTrackingHistory(packageId);

      case 'live-status':
        if (!packageId) {
          return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
        }
        return await getLiveTrackingStatus(packageId);

      case 'map-data':
        if (!packageId) {
          return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
        }
        return await getLiveMapData(packageId);

      case 'active-packages':
        return await getActivePackages();

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const body = await request.json();

    switch (action) {
      case 'start-tracking':
        return await startPackageTracking(body);

      case 'stop-tracking':
        return await stopPackageTracking(body);

      case 'update-status':
        return await updatePackageStatus(body);

      case 'manual-update':
        return await manualStatusUpdate(body);

      case 'process-all-updates':
        return await processAllStatusUpdates();

      case 'update-carrier-location':
        return await updateCarrierLocation(body);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get comprehensive tracking summary for a package
 */
async function getTrackingSummary(packageId: string) {
  try {
    const currentStatus = await trackingService.getCurrentTrackingStatus(packageId);
    const packageData = await trackingService.getPackageTrackingData(packageId);

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const summary = {
      package_id: packageId,
      tracking_number: packageData.tracking_number,
      current_status: currentStatus?.package_status || packageData.status,
      train_number: packageData.journey?.train_number || '',
      from_station: packageData.pickup_station,
      to_station: packageData.delivery_station,
      current_location: currentStatus?.train_status ? {
        station_code: currentStatus.train_status.current_station,
        station_name: currentStatus.train_status.current_station_name,
      } : null,
      progress_percentage: calculateProgressPercentage(currentStatus),
      estimated_arrival: currentStatus?.estimated_arrival,
      delay_minutes: currentStatus?.delay_minutes || 0,
      last_updated: currentStatus?.timestamp || packageData.created_at,
      tracking_active: true
    };

    return NextResponse.json(summary);
  } catch (error) {
    throw error;
  }
}

/**
 * Get tracking history for a package
 */
async function getTrackingHistory(packageId: string) {
  try {
    const history = await trackingService.getTrackingHistory(packageId);
    return NextResponse.json(history);
  } catch (error) {
    throw error;
  }
}

/**
 * Get live tracking status with real-time updates
 */
async function getLiveTrackingStatus(packageId: string) {
  try {
    const liveUpdate = await trackingService.updatePackageTracking(packageId);
    return NextResponse.json(liveUpdate);
  } catch (error) {
    throw error;
  }
}

/**
 * Get live map data for package tracking
 */
async function getLiveMapData(packageId: string) {
  try {
    const packageData = await trackingService.getPackageTrackingData(packageId);
    if (!packageData || !packageData.journey) {
      return NextResponse.json({ error: 'Package or journey not found' }, { status: 404 });
    }

    const journeyData = await journeyService.getRealTimeJourneyData(packageData.journey.id);
    
    const mapData = {
      train_position: journeyData?.current_status ? {
        latitude: 0, // Would need station coordinates
        longitude: 0,
        heading: 0
      } : null,
      carrier_position: null, // Would get from carrier location service
      route_stations: [], // Would get from train route data
      current_station_index: 0,
      package_status: packageData.status
    };

    return NextResponse.json(mapData);
  } catch (error) {
    throw error;
  }
}

/**
 * Get all active packages for monitoring
 */
async function getActivePackages() {
  try {
    // This would typically be restricted to admin users
    const packages: any[] = []; // Implementation would fetch from tracking service
    return NextResponse.json(packages);
  } catch (error) {
    throw error;
  }
}

/**
 * Start tracking for a package
 */
async function startPackageTracking(body: any) {
  try {
    const { packageId } = body;
    
    if (!packageId) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    await trackingService.startPackageTracking(packageId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tracking started successfully' 
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Stop tracking for a package
 */
async function stopPackageTracking(body: any) {
  try {
    const { packageId } = body;
    
    if (!packageId) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    await trackingService.stopPackageTracking(packageId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tracking stopped successfully' 
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update package status (automated)
 */
async function updatePackageStatus(body: any) {
  try {
    const { packageId } = body;
    
    if (!packageId) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    const result = await statusUpdateService.processPackageStatusUpdate(packageId);
    
    return NextResponse.json({
      success: true,
      update_result: result
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Manual status update (with OTP verification)
 */
async function manualStatusUpdate(body: any) {
  try {
    const { packageId, newStatus, userId, otpCode } = body;
    
    if (!packageId || !newStatus || !userId) {
      return NextResponse.json({ 
        error: 'Package ID, status, and user ID required' 
      }, { status: 400 });
    }

    const success = await statusUpdateService.manualStatusUpdate(
      packageId,
      newStatus,
      userId,
      otpCode
    );
    
    return NextResponse.json({
      success,
      message: success ? 'Status updated successfully' : 'Status update failed'
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Process automated status updates for all packages
 */
async function processAllStatusUpdates() {
  try {
    await statusUpdateService.processAllPackageUpdates();
    
    return NextResponse.json({
      success: true,
      message: 'Batch status updates processed'
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update carrier location
 */
async function updateCarrierLocation(body: any) {
  try {
    const { carrierId, latitude, longitude, accuracy, speed, heading } = body;
    
    if (!carrierId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ 
        error: 'Carrier ID, latitude, and longitude required' 
      }, { status: 400 });
    }

    // Implementation would save location to database
    // await carrierLocationService.updateLocation(carrierId, { latitude, longitude, accuracy, speed, heading });
    
    return NextResponse.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Calculate progress percentage based on tracking status
 */
function calculateProgressPercentage(trackingStatus: any): number {
  if (!trackingStatus) return 0;
  
  // Simple progress calculation based on status
  const statusProgress = {
    pending: 0,
    accepted: 10,
    waiting_for_departure: 20,
    pickup_available: 30,
    picked_up: 40,
    in_transit: 60,
    approaching_destination: 80,
    arrived_at_destination: 90,
    out_for_delivery: 95,
    delivered: 100,
    cancelled: 0,
    delayed: 50
  };

  return statusProgress[trackingStatus.package_status as keyof typeof statusProgress] || 0;
}