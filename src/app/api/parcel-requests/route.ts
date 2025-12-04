import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import CentralizedFeeCalculator, { ParcelDetails } from '@/lib/centralizedFeeCalculator';

export interface CreateParcelRequestData {
  senderId: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  receiverName: string;
  receiverPhone: string;
  weight: number;
  length: number;
  breadth: number;
  height: number;
  parcelType: string;
  description?: string;
  preferredDate: string;
  coachType: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateParcelRequestData = await request.json();

    // Validate required fields
    if (!data.senderId || !data.fromStationCode || !data.toStationCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the user profile from Supabase Auth ID (not Firebase UID)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('id', data.senderId)  // Use id directly, not firebase_uid
      .single();

    if (profileError || !userProfile) {
      console.error('User profile lookup error:', profileError);
      return NextResponse.json(
        { error: 'User profile not found. Please try logging in again.' },
        { status: 404 }
      );
    }

    console.log('Found user profile:', userProfile);

    // Calculate estimated fare using the centralized fee calculator
    let estimatedFare = 250; // Default fallback
    let feeBreakdown = {
      baseFare: 50,
      weightFare: data.weight * 2,
      dimensionFare: (data.length + data.breadth + data.height) * 1,
      distanceFare: 100, // Default
      total: estimatedFare
    };

    try {
      const parcelDetails: ParcelDetails = {
        weight: data.weight,
        length: data.length,
        breadth: data.breadth,
        height: data.height,
        fromStationCode: data.fromStationCode,
        toStationCode: data.toStationCode
      };

      const feeResult = await CentralizedFeeCalculator.calculateFee(parcelDetails);
      estimatedFare = feeResult.totalFee;
      feeBreakdown = {
        baseFare: feeResult.baseFee,
        weightFare: feeResult.weightFee,
        dimensionFare: feeResult.dimensionFee,
        distanceFare: feeResult.distanceFee,
        total: feeResult.totalFee
      };
    } catch (feeError) {
      console.error('Error calculating fee with CentralizedFeeCalculator, using fallback:', feeError);
      // Keep the fallback values set above
    }

    // Combine parcel details with receiver info in description
    const combinedDescription = [
      `Parcel Type: ${data.parcelType}`,
      `Receiver: ${data.receiverName}`,
      `Receiver Phone: ${data.receiverPhone}`,
      `Preferred Coach: ${data.coachType}`,
      data.description ? `Additional Notes: ${data.description}` : ''
    ].filter(Boolean).join('\n');

    const requestData = {
      sender_id: userProfile.id, // Use the validated user profile ID
      pickup_station: data.fromStationName,
      pickup_station_code: data.fromStationCode,
      drop_station: data.toStationName,
      drop_station_code: data.toStationCode,
      weight: data.weight,
      length: data.length,
      width: data.breadth,
      height: data.height,
      description: combinedDescription,
      pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      estimated_fare: estimatedFare,
      status: 'PENDING_PAYMENT' as const, // Updated to use new enum value
      payment_status: 'PENDING' as const, // Set initial payment status
      fee_breakdown: feeBreakdown,
      preferred_date: data.preferredDate,
      coach_type: data.coachType
    };

    console.log('Creating parcel request with admin client:', requestData);

    const { data: result, error } = await supabaseAdmin
      .from('parcel_requests')
      .insert(requestData)
      .select()
      .single();

    if (error) {
      console.error('Database error details:', error);
      console.error('Request data that failed:', requestData);
      return NextResponse.json(
        { error: `Failed to create parcel request: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Parcel request created successfully:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




