'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import ParcelFeeCalculator from '@/components/ParcelFeeCalculator';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function FeeCalculatorPage() {
  const router = useRouter();

  return (
    <ProtectedRoute requireRole="sender">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Parcel Fee Calculator</h1>
            <p className="text-muted-foreground">
              Calculate shipping costs for your parcel before creating a request
            </p>
          </div>
        </div>

        {/* Fee Calculator Component */}
        <ParcelFeeCalculator />
      </div>
    </ProtectedRoute>
  );
}