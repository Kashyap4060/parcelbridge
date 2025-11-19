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
  preferred_date: string | null;
  coach_type: string | null;
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
  preferredDate: string;
  coachType: string;
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

export async function getSenderParcelRequests(supabaseUserId: string) {
  // Use the Supabase user ID directly to get parcel requests
  const { data, error } = await supabase
    .from('parcel_requests')
    .select('*')
    .eq('sender_id', supabaseUserId)
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

export async function deleteParcelRequest(requestId: string, senderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Attempting to delete parcel request:', { requestId, senderId });
    
    // Delete directly - RLS policies will handle authorization
    // Using select() to return deleted data for verification
    const { data, error } = await supabase
      .from('parcel_requests')
      .delete()
      .eq('id', requestId)
      .eq('sender_id', senderId)
      .select('id');

    if (error) {
      console.error('Error deleting parcel request:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.error('No rows were deleted - request may not exist or permission denied');
      return { success: false, error: 'Request not found or you do not have permission to delete it' };
    }

    console.log('Successfully deleted parcel request:', requestId);
    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting parcel request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update parcel request payment status after successful payment
 */
export async function updateParcelRequestPayment(
  requestId: string, 
  paymentData: {
    paymentId: string;
    orderId: string;
    amount: number;
    status: 'PAID' | 'PENDING';
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('parcel_requests')
      .update({
        payment_held: paymentData.amount,
        payment_id: paymentData.paymentId,
        payment_order_id: paymentData.orderId,
        payment_status: paymentData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating parcel request payment:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating parcel request payment:', error);
    return { success: false, error: error.message };
  }
}






