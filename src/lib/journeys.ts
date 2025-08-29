import { supabase } from '@/lib/supabase';

export interface JourneyRow {
  id: string;
  carrier_id: string;
  pnr: string;
  train_number: string;
  train_name: string | null;
  source_station: string;
  source_station_code: string;
  destination_station: string;
  destination_station_code: string;
  stations: string[] | null;
  journey_date: string;
  departure_time: string | null;
  arrival_time: string | null;
  arrival_date: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getJourneysByCarrier(carrierId: string) {
  const { data, error } = await supabase
    .from('train_journeys')
    .select('*')
    .eq('carrier_id', carrierId)
    .order('journey_date', { ascending: true });
  if (error) throw error;
  return (data || []) as JourneyRow[];
}

export async function getActiveJourneysByCarrier(carrierId: string) {
  const { data, error } = await supabase
    .from('train_journeys')
    .select('*')
    .eq('carrier_id', carrierId)
    .eq('is_active', true)
    .order('journey_date', { ascending: true });
  if (error) throw error;
  return (data || []) as JourneyRow[];
}

export async function deleteJourneyById(journeyId: string, carrierId: string) {
  const { error } = await supabase
    .from('train_journeys')
    .delete()
    .eq('id', journeyId)
    .eq('carrier_id', carrierId);
  if (error) throw error;
}


