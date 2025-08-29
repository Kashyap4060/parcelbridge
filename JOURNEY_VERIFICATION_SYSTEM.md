# Journey Verification System

## Overview

The Journey Verification System ensures that carriers can only accept parcels that align with their verified train journeys. This system validates:

1. **Aadhaar Verification** - Carrier identity verification
2. **Journey Verification** - Valid PNR and active train journey
3. **Route Matching** - Parcel pickup/drop stations match carrier's journey route
4. **Date Compatibility** - Journey dates align with parcel pickup requirements

## Architecture

### Core Components

1. **JourneyVerificationService** (`src/lib/journeyVerificationService.ts`)
   - Main service for journey-parcel matching logic
   - Route analysis and compatibility checking
   - Verification requirement validation

2. **useJourneyVerification Hook** (`src/hooks/useJourneyVerification.ts`)
   - React hook for frontend verification logic
   - Real-time verification status updates
   - Auto-verification on data changes

3. **JourneyVerificationComponent** (`src/components/JourneyVerificationComponent.tsx`)
   - UI component displaying verification results
   - Visual indicators for match status
   - Detailed verification breakdown

4. **API Endpoint** (`src/app/api/verify-journey/route.ts`)
   - Server-side verification endpoint
   - Database integration for journey/parcel data
   - Batch verification for multiple parcels

## Verification Process

### 1. Route Matching Algorithm

```typescript
// Check if parcel stations are in journey route
const journeyStations = [
  journey.sourceStationCode,
  ...journey.stations,
  journey.destinationStationCode
];

// Exact match check
const pickupMatch = journeyStations.includes(parcelPickupStation);
const dropMatch = journeyStations.includes(parcelDropStation);

// Route inclusion analysis for non-exact matches
if (!pickupMatch || !dropMatch) {
  const routeAnalysis = await analyzeRouteInclusion(journey, parcel);
}
```

### 2. Match Types

- **EXACT**: Both pickup and drop stations are direct stops on journey
- **ROUTE_OVERLAP**: Stations are on the journey route but may require intermediate stops
- **NO_MATCH**: Parcel route doesn't align with journey

### 3. Confidence Scoring

- **95%**: Exact station matches + date compatibility
- **75%**: Route overlap + date compatibility  
- **40%**: Route overlap but date issues
- **0%**: No route alignment

### 4. Verification Requirements

```typescript
interface VerificationRequirement {
  aadhaarVerified: boolean;     // KYC verification
  journeyVerified: boolean;     // Valid PNR journey
  routeMatch: boolean;         // Route compatibility
  requiredDocuments: string[]; // Missing requirements
  verificationScore: number;   // 0-100 overall score
}
```

## Implementation Guide

### Frontend Integration

```tsx
import { JourneyVerificationComponent } from '@/components/JourneyVerificationComponent';

function ParcelAcceptanceModal({ parcel, journey, carrierUid }) {
  const [canAccept, setCanAccept] = useState(false);
  
  return (
    <div>
      <JourneyVerificationComponent
        journey={journey}
        parcel={parcel}
        carrierUid={carrierUid}
        onVerificationComplete={setCanAccept}
      />
      
      <button 
        disabled={!canAccept}
        onClick={handleAcceptParcel}
      >
        Accept Parcel
      </button>
    </div>
  );
}
```

### API Usage

```typescript
// Verify specific journey-parcel match
const response = await fetch('/api/verify-journey', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    journeyId: 'journey_123',
    parcelId: 'parcel_456', 
    carrierUid: 'carrier_789'
  })
});

const { canAccept, matchResult, verificationRequirements } = await response.json();
```

### Hook Usage

```tsx
import { useJourneyVerification } from '@/hooks/useJourneyVerification';

function CarrierDashboard({ journey, availableParcels, carrierUid }) {
  const {
    isVerifying,
    matchResult, 
    canAcceptParcel,
    verificationStatus
  } = useJourneyVerification({ journey, parcel, carrierUid });
  
  return (
    <div>
      <div className={`status-${verificationStatus.color}`}>
        {verificationStatus.message}
      </div>
      {canAcceptParcel && (
        <button onClick={handleAccept}>Accept Parcel</button>
      )}
    </div>
  );
}
```

## Security Features

### 1. Multi-Factor Verification
- **Aadhaar KYC**: Government ID verification
- **PNR Validation**: Real train journey verification
- **Route Matching**: Geographic validation

### 2. Anti-Fraud Measures
- Journey date validation (prevents backdating)
- Station sequence validation (prevents route manipulation)
- Distance-based route validation
- Real-time PNR status checking

### 3. Confidence Thresholds
- Minimum 60% confidence required for parcel acceptance
- Exact matches preferred over route overlaps
- Manual review required for edge cases

## Database Schema

### Required Tables

```sql
-- Journeys table
CREATE TABLE journeys (
  id UUID PRIMARY KEY,
  carrier_uid TEXT NOT NULL,
  pnr VARCHAR(10) NOT NULL,
  train_number VARCHAR(10),
  source_station_code VARCHAR(10),
  destination_station_code VARCHAR(10),
  stations TEXT[], -- Array of station codes
  journey_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Parcel requests table  
CREATE TABLE parcel_requests (
  id UUID PRIMARY KEY,
  sender_uid TEXT NOT NULL,
  pickup_station TEXT NOT NULL,
  drop_station TEXT NOT NULL,
  pickup_time TIMESTAMP,
  weight DECIMAL,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Station data table
CREATE TABLE stations (
  code VARCHAR(10) PRIMARY KEY,
  name TEXT NOT NULL,
  lat DECIMAL,
  lng DECIMAL,
  state TEXT,
  zone TEXT
);

-- Station distances table
CREATE TABLE station_distances (
  id UUID PRIMARY KEY,
  from_station VARCHAR(10),
  to_station VARCHAR(10),
  distance_km DECIMAL,
  FOREIGN KEY (from_station) REFERENCES stations(code),
  FOREIGN KEY (to_station) REFERENCES stations(code)
);
```

## Error Handling

### Common Error Scenarios

1. **Station Not Found**: Parcel station not in railway network
2. **Date Mismatch**: Journey date incompatible with parcel pickup
3. **Route Direction**: Drop station before pickup in journey sequence
4. **Verification Failure**: Aadhaar or PNR verification issues

### Error Messages

```typescript
const errorMessages = {
  STATION_NOT_FOUND: 'Station not found in railway network',
  DATE_INCOMPATIBLE: 'Journey date doesn\'t match parcel requirements',
  ROUTE_MISMATCH: 'Parcel route doesn\'t align with your journey',
  AADHAAR_REQUIRED: 'Aadhaar verification required',
  PNR_INVALID: 'Invalid or expired PNR',
  JOURNEY_INACTIVE: 'Journey is no longer active'
};
```

## Testing

### Test Scenarios

1. **Exact Match**: Journey has exact pickup/drop stations
2. **Route Overlap**: Stations on journey path but not direct stops  
3. **No Match**: Completely different routes
4. **Date Issues**: Past journey dates, future parcels
5. **Verification Gaps**: Missing Aadhaar, invalid PNR

### Mock Data

```typescript
const mockJourney = {
  id: 'journey_1',
  trainNumber: '12345',
  sourceStationCode: 'NDLS',
  destinationStationCode: 'BOM',
  stations: ['AGR', 'JHS', 'BPL', 'NGP'],
  journeyDate: new Date('2025-08-25'),
  isActive: true
};

const mockParcel = {
  id: 'parcel_1', 
  pickupStation: 'Agra Cantonment',
  dropStation: 'Bhopal Junction',
  pickupTime: new Date('2025-08-25T10:00:00Z'),
  weight: 2.5
};
```

## Performance Considerations

1. **Caching**: Cache station lookups and distance calculations
2. **Batch Processing**: Verify multiple parcels in single API call
3. **Lazy Loading**: Load verification details on demand
4. **Debouncing**: Prevent excessive verification calls

## Future Enhancements

1. **AI-Powered Matching**: Machine learning for route optimization
2. **Real-Time Tracking**: Live train location integration
3. **Dynamic Pricing**: Route-based fare calculations
4. **Carrier Recommendations**: Suggest best carriers for parcels
5. **Risk Scoring**: Carrier reliability metrics
