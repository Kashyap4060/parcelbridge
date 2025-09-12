'use client';

import { useParams, useSearchParams } from 'next/navigation';
import JourneyDetailsView from '@/components/JourneyDetailsView';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function JourneyDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const journeyId = params?.journeyId as string;
  const parcelId = searchParams?.get('parcelId') || undefined;

  if (!journeyId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid journey ID</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <JourneyDetailsView 
        journeyId={journeyId} 
        parcelId={parcelId}
      />
    </ProtectedRoute>
  );
}