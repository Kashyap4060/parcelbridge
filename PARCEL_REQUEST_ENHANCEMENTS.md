# Parcel Request Enhancement - Date and Coach Type Fields

## Summary
Added two new fields to the parcel creation form as requested:

1. **Preferred Send Date** - Date picker for when the sender wants to send their parcel
2. **Coach Type** - Dropdown with all Indian railway coach types

## Changes Made

### Frontend Changes

#### 1. Create Request Form (`src/app/dashboard/sender/create-request/page.tsx`)
- Added `preferredDate` and `coachType` to form state
- Created new "Delivery Preferences" card section in the form
- Added date picker input with validation to prevent past dates
- Added coach type dropdown with categorized options:
  - **Luxury / High-end Classes**: 1A, 2A, 3A, 3E, EC, CC
  - **Middle & Budget Classes**: SL, 2S, GN
  - **Special AC Coaches**: Anubhuti, Vistadome, DDCC
- Added form validation for both fields
- Updated request data object to include new fields

### Backend Changes

#### 2. API Interface Updates
- Updated `CreateParcelRequestData` interface in both:
  - `src/app/api/parcel-requests/route.ts`
  - `src/lib/parcelRequests.ts`
- Added `preferredDate` and `coachType` to request processing
- Updated database insertion to include new fields
- Added coach type to parcel description for visibility

#### 3. Database Schema (`add-parcel-preferences.sql`)
- Added `preferred_date DATE` column
- Added `coach_type VARCHAR(50)` column
- Created indexes for efficient querying
- Added constraints:
  - Date must not be in the past
  - Coach type must be valid railway coach code
- Added documentation comments

#### 4. TypeScript Types
- Updated `ParcelRequestRow` interface to include new fields
- Maintained type safety across the application

## Coach Types Supported

### Luxury / High-end Classes
- **1A** - First AC / AC First Class (fully air-conditioned, cabins with lockable doors)
- **2A** - AC Two Tier (air-conditioned, sleeping berths in two tiers)
- **3A** - AC Three Tier (air-conditioned, sleeping berths in three tiers)
- **3E** - AC Three Tier Economy (similar to 3A but with extra berths)
- **EC** - Executive Chair Car (premium seating, mainly in Shatabdi & Tejas trains)
- **CC** - AC Chair Car (air-conditioned seating, 2x3 layout)

### Middle & Budget Classes
- **SL** - Sleeper Class (non-AC, most common class with sleeping berths)
- **2S** - Second Sitting (non-AC seating, bench-style)
- **GN** - General / Unreserved Coach (basic seating, no reservation)

### Special AC Coaches
- **Anubhuti** - Premium luxury coach in select Shatabdi/Tejas
- **Vistadome** - Coaches with glass roof and wide windows for scenic routes
- **DDCC** - Double Decker AC Chair Car (used on select routes, two-level seating)

## Database Migration Required

Before using these features in production, run the database migration:

```sql
-- Execute the SQL in add-parcel-preferences.sql
-- This adds the new columns and constraints to the parcel_requests table
```

## Validation Rules

1. **Preferred Date**: Must be current date or future date (no past dates allowed)
2. **Coach Type**: Must be one of the predefined valid coach types
3. Both fields are required when creating a parcel request

## UI/UX Features

- Date picker with calendar interface
- Categorized dropdown for easy coach type selection  
- Inline help text explaining each field
- Real-time validation with error messages
- Responsive design for mobile and desktop

## Testing

The development server is running successfully with all changes integrated. Test the new fields by:

1. Navigate to `/dashboard/sender/create-request`
2. Fill in the form including the new date and coach type fields
3. Verify validation works for past dates and invalid selections
4. Submit the form to ensure data is properly saved

All TypeScript compilation passes without errors and the form maintains existing functionality while adding the new features.