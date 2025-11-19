/**
 * Railway MCP API Route
 * Provides Railway data through Next.js API for client-side use
 */

import { NextRequest, NextResponse } from 'next/server';
import { RailwayMCPService } from '@/lib/railwayMCPService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'search-trains':
        return await handleSearchTrains(params);
      
      case 'train-info':
        return await handleTrainInfo(params);
      
      case 'live-status':
        return await handleLiveStatus(params);
      
      case 'station-code':
        return await handleStationCode(params);
      
      case 'distance':
        return await handleDistanceCalculation(params);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: search-trains, train-info, live-status, station-code, distance' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Railway MCP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSearchTrains(params: any) {
  try {
    const { from, to, date } = params;
    
    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters: from, to' },
        { status: 400 }
      );
    }

    const searchDate = date ? new Date(date) : new Date();
    const trains = await RailwayMCPService.searchTrains(from, to, searchDate);
    
    return NextResponse.json({
      success: true,
      data: trains,
      count: trains.length
    });
  } catch (error) {
    console.error('Search trains error:', error);
    return NextResponse.json(
      { error: 'Failed to search trains' },
      { status: 500 }
    );
  }
}

async function handleTrainInfo(params: any) {
  try {
    const { trainNumber } = params;
    
    if (!trainNumber) {
      return NextResponse.json(
        { error: 'Missing required parameter: trainNumber' },
        { status: 400 }
      );
    }

    const trainInfo = await RailwayMCPService.getTrainInfo(trainNumber);
    
    if (!trainInfo) {
      return NextResponse.json(
        { error: 'Train not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: trainInfo
    });
  } catch (error) {
    console.error('Train info error:', error);
    return NextResponse.json(
      { error: 'Failed to get train information' },
      { status: 500 }
    );
  }
}

async function handleLiveStatus(params: any) {
  try {
    const { trainNumber, date } = params;
    
    if (!trainNumber) {
      return NextResponse.json(
        { error: 'Missing required parameter: trainNumber' },
        { status: 400 }
      );
    }

    const statusDate = date ? new Date(date) : new Date();
    const liveStatus = await RailwayMCPService.getLiveTrainStatus(trainNumber, statusDate);
    
    if (!liveStatus) {
      return NextResponse.json(
        { error: 'Live status not available' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: liveStatus
    });
  } catch (error) {
    console.error('Live status error:', error);
    return NextResponse.json(
      { error: 'Failed to get live status' },
      { status: 500 }
    );
  }
}

async function handleStationCode(params: any) {
  try {
    const { name } = params;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required parameter: name' },
        { status: 400 }
      );
    }

    const stationCode = await RailwayMCPService.getStationCode(name);
    
    if (!stationCode) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: stationCode
    });
  } catch (error) {
    console.error('Station code error:', error);
    return NextResponse.json(
      { error: 'Failed to get station code' },
      { status: 500 }
    );
  }
}

async function handleDistanceCalculation(params: any) {
  try {
    const { from, to } = params;
    
    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters: from, to' },
        { status: 400 }
      );
    }

    const distance = await RailwayMCPService.getAccurateDistance(from, to);
    
    return NextResponse.json({
      success: true,
      data: {
        from,
        to,
        distance,
        source: distance ? 'railway_mcp' : 'fallback'
      }
    });
  } catch (error) {
    console.error('Distance calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Railway MCP API',
    version: '1.0.0',
    endpoints: [
      'POST /api/railway - Main endpoint with action parameter',
      'Actions: search-trains, train-info, live-status, station-code, distance'
    ],
    example: {
      action: 'distance',
      from: 'LTT',
      to: 'NCB'
    }
  });
}