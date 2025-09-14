import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export interface CreateJourneyData {
  pnr: string;
  trainNumber: string;
  trainName: string;
  fromStation: string;
  toStation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  coachType: string;
  coachNumber: string;
  seatNumber: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseUid, journeyData }: { firebaseUid: string; journeyData: CreateJourneyData } = body;

    if (!firebaseUid || !journeyData) {
      return NextResponse.json(
        { success: false, error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Get the user's Supabase profile ID from Firebase UID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (profileError || !userProfile) {
      console.error('User profile lookup error:', profileError);
      return NextResponse.json(
        { success: false, error: 'User profile not found. Please ensure your account is properly set up.' },
        { status: 404 }
      );
    }

    // Check if PNR already exists
    const { data: existingJourney } = await supabaseAdmin
      .from('train_journeys')
      .select('id')
      .eq('pnr', journeyData.pnr)
      .single();

    if (existingJourney) {
      return NextResponse.json(
        { success: false, error: 'This PNR is already registered by another carrier. Please use a different PNR.' },
        { status: 409 }
      );
    }

    // Prepare journey data for insertion
    const insertData = {
      carrier_id: userProfile.id, // Use Supabase UUID, not Firebase UID
      pnr: journeyData.pnr,
      train_number: journeyData.trainNumber,
      train_name: journeyData.trainName,
      source_station: journeyData.fromStation,
      source_station_code: '', // TODO: Extract from station data
      destination_station: journeyData.toStation,
      destination_station_code: '', // TODO: Extract from station data
      journey_date: journeyData.departureDate,
      departure_time: journeyData.departureTime,
      arrival_time: journeyData.arrivalTime,
      arrival_date: journeyData.arrivalDate,
      coach_number: journeyData.coachNumber,
      seat_number: journeyData.seatNumber,
      class: journeyData.coachType,
      is_active: true
    };

    // Insert the journey using admin client to bypass RLS
    const { data: newJourney, error: insertError } = await supabaseAdmin
      .from('train_journeys')
      .insert(insertData)
      .select('id')
      .single();

    if (insertError) {
      console.error('Journey insertion error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create journey. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      journeyId: newJourney.id
    });

  } catch (error) {
    console.error('Error creating journey:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}




