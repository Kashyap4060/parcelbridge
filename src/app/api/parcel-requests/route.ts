import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Find the user profile from Firebase UID
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('firebase_uid', data.senderId)
      .single();

    if (profileError || !userProfile) {
      console.error('User profile lookup error:', profileError);
      return NextResponse.json(
        { error: 'User profile not found. Please try logging in again.' },
        { status: 404 }
      );
    }

    console.log('Found user profile:', userProfile);

    // Calculate estimated fare based on distance and weight (basic calculation)
    const baseFare = 50; // Base fare in rupees
    const perKgRate = 20; // Rate per kg
    const estimatedFare = baseFare + (data.weight * perKgRate);

    // Combine parcel details with receiver info in description
    const combinedDescription = [
      `Parcel Type: ${data.parcelType}`,
      `Receiver: ${data.receiverName}`,
      `Receiver Phone: ${data.receiverPhone}`,
      data.description ? `Additional Notes: ${data.description}` : ''
    ].filter(Boolean).join('\n');

    const requestData = {
      sender_id: userProfile.id, // Use the Supabase user profile ID
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
      status: 'PENDING' as const,
      fee_breakdown: {
        baseFare,
        weightFare: data.weight * perKgRate,
        total: estimatedFare
      }
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



