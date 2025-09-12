import { supabase } from '@/lib/supabase';

export interface ParcelRequestRow {
  id: string;
  sender_id: string;
  carrier_id: string | null;
  pickup_station: string;
  pickup_station_code: string;
  drop_station: string;
  drop_station_code: string;
  weight: number;
  length: number | null;
  width: number | null;
  height: number | null;
  description: string | null;
  pickup_time: string;
  estimated_fare: number;
  payment_held: number | null;
  fee_breakdown: any;
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

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

export async function createParcelRequest(data: CreateParcelRequestData): Promise<ParcelRequestRow> {
  try {
    const response = await fetch('/api/parcel-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create parcel request');
    }

    const result = await response.json();
    return result as ParcelRequestRow;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

export async function getSenderParcelRequests(firebaseUid: string) {
  // First, find the user profile ID from Firebase UID
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('firebase_uid', firebaseUid)
    .single();

  if (profileError || !userProfile) {
    throw new Error('User profile not found');
  }

  const { data, error } = await supabase
    .from('parcel_requests')
    .select('*')
    .eq('sender_id', userProfile.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as ParcelRequestRow[];
}

export async function getPendingParcelRequests() {
  const { data, error } = await supabase
    .from('parcel_requests')
    .select('*')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ParcelRequestRow[];
}





