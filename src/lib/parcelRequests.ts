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

export async function getSenderParcelRequests(senderId: string) {
  const { data, error } = await supabase
    .from('parcel_requests')
    .select('*')
    .eq('sender_id', senderId)
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


