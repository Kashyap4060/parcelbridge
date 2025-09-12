import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pnr = searchParams.get('pnr');

    if (!pnr) {
      return NextResponse.json(
        { exists: false, error: 'PNR parameter is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('train_journeys')
      .select('id')
      .eq('pnr', pnr)
      .single();

    // If no error and data exists, PNR already exists
    if (data && !error) {
      return NextResponse.json({ exists: true });
    }

    // If error is "PGRST116" (no rows found), PNR doesn't exist
    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ exists: false });
    }

    // For any other error, log it and assume PNR doesn't exist
    if (error) {
      console.error('Error checking PNR:', error);
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('Error checking PNR existence:', error);
    return NextResponse.json(
      { exists: false, error: 'Failed to check PNR' },
      { status: 500 }
    );
  }
}



