import { useState, useEffect } from 'react';
import { parcelStatusService, ParcelStatusTimeline } from '@/lib/parcelStatusService';

export function useParcelTimeline(parcelId: string) {
  const [timeline, setTimeline] = useState<ParcelStatusTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parcelId) return;

    loadTimeline();
  }, [parcelId]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await parcelStatusService.getParcelTimeline(parcelId);
      setTimeline(data);
    } catch (err) {
      console.error('Error loading parcel timeline:', err);
      setError('Failed to load parcel timeline');
    } finally {
      setLoading(false);
    }
  };

  const refreshTimeline = () => {
    loadTimeline();
  };

  return {
    timeline,
    loading,
    error,
    refreshTimeline
  };
}
