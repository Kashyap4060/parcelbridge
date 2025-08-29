import { NextRequest, NextResponse } from 'next/server';
import { journeyVerificationService } from '@/lib/journeyVerificationService';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { journeyId, parcelId, carrierUid } = await request.json();

    if (!journeyId || !parcelId || !carrierUid) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Fetch journey data
    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .select('*')
      .eq('id', journeyId)
      .eq('carrier_uid', carrierUid)
      .single();

    if (journeyError || !journey) {
      return NextResponse.json(
        { error: 'Journey not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch parcel data
    const { data: parcel, error: parcelError } = await supabase
      .from('parcel_requests')
      .select('*')
      .eq('id', parcelId)
      .eq('status', 'PENDING')
      .single();

    if (parcelError || !parcel) {
      return NextResponse.json(
        { error: 'Parcel not found or not available' },
        { status: 404 }
      );
    }

    // Verify journey-parcel match
    const matchResult = await journeyVerificationService.verifyJourneyParcelMatch(
      journey,
      parcel
    );

    // Check carrier verification requirements
    const verificationRequirements = await journeyVerificationService
      .checkCarrierVerificationRequirements(carrierUid, parcel);

    // Determine if carrier can accept the parcel
    const canAccept = matchResult.isMatch && 
                     matchResult.confidence >= 60 &&
                     verificationRequirements.aadhaarVerified &&
                     verificationRequirements.journeyVerified;

    return NextResponse.json({
      success: true,
      canAccept,
      matchResult,
      verificationRequirements,
      message: canAccept 
        ? 'Verification successful - you can accept this parcel'
        : 'Verification requirements not met'
    });

  } catch (error) {
    console.error('Journey verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carrierUid = searchParams.get('carrierUid');
    
    if (!carrierUid) {
      return NextResponse.json(
        { error: 'Carrier UID required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get carrier's active journeys
    const { data: journeys, error: journeysError } = await supabase
      .from('journeys')
      .select('*')
      .eq('carrier_uid', carrierUid)
      .eq('is_active', true);

    if (journeysError) {
      throw journeysError;
    }

    // Get available parcels that might match carrier's routes
    const { data: parcels, error: parcelsError } = await supabase
      .from('parcel_requests')
      .select('*')
      .eq('status', 'PENDING')
      .limit(10);

    if (parcelsError) {
      throw parcelsError;
    }

    // Find matching parcels for each journey
    const matches = [];
    for (const journey of journeys || []) {
      for (const parcel of parcels || []) {
        const matchResult = await journeyVerificationService
          .verifyJourneyParcelMatch(journey, parcel);
        
        if (matchResult.isMatch) {
          matches.push({
            journey,
            parcel,
            matchResult
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      activeJourneys: journeys?.length || 0,
      availableParcels: parcels?.length || 0,
      matches: matches.length,
      matchingParcels: matches
    });

  } catch (error) {
    console.error('Journey verification status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
