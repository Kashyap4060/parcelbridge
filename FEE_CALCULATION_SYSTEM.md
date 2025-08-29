# 💵 Parcel Fee Calculation System

## 📋 Overview

The Parcel-Bridge platform uses a **distance and weight-based fee calculation system** to provide transparent and fair pricing for parcel delivery services.

## 🧮 Fee Calculation Formula

```typescript
Total Fee = Base Weight Fee + (Distance in km × Cost per km)
```

### Weight Tiers

| Weight Range | Base Fee | Cost/km | Label |
|-------------|----------|---------|-------|
| 0-2 kg      | ₹50      | ₹1/km   | Under 2 kg |
| 2-5 kg      | ₹100     | ₹1/km   | 2-5 kg |
| 5-10 kg     | ₹150     | ₹1.5/km | 5-10 kg |
| 10+ kg      | Manual Quote Required | - | Heavy Parcel |

### Examples

**Example 1: Light Parcel**
- Weight: 1.5 kg
- Distance: Mumbai to Delhi (1400 km)
- Calculation: ₹50 + (1400 × ₹1) = **₹1,450**

**Example 2: Medium Parcel**
- Weight: 3 kg  
- Distance: Chennai to Bangalore (350 km)
- Calculation: ₹100 + (350 × ₹1) = **₹450**

**Example 3: Heavy Parcel**
- Weight: 8 kg
- Distance: Kolkata to Mumbai (1980 km)  
- Calculation: ₹150 + (1980 × ₹1.5) = **₹3,120**

## 🗺️ Distance Calculation

### Current Implementation
- **Mock Data**: Using predefined distances for major routes
- **Coverage**: 25+ popular station pairs
- **Fallback**: 500km default for unknown routes

### Future Implementation
- **Excel Integration**: Complete station database from Indian Railways
- **Real-time Updates**: Distance data updated via admin panel
- **Route Optimization**: Multiple route options with varying costs

## 🔧 Technical Implementation

### Core Files

#### `src/lib/feeCalculation.ts`
- Weight tier definitions
- Fee calculation logic  
- Distance lookup functions
- Validation utilities

#### `src/components/ui/FeeCalculator.tsx`
- Interactive fee calculator component
- Real-time fee updates
- Validation and error handling

#### `src/hooks/useFeeCalculation.ts`
- React hook for fee calculations
- State management for fee data
- Loading and error states

#### `src/components/ui/FeeDisplay.tsx`
- Fee display component with breakdown
- Formatted fee presentation
- Breakdown visualization

### Usage Examples

```typescript
// Hook Usage
const { fee, breakdown, calculateFee } = useFeeCalculation();
calculateFee(2.5, 'Mumbai Central', 'Delhi Junction');

// Direct Calculation
const result = getFeeEstimate(3.0, 'Chennai', 'Bangalore');
if (result.success) {
  console.log(`Fee: ₹${result.fee}`);
}

// Component Usage
<FeeCalculator 
  onFeeCalculated={(fee, breakdown) => console.log(fee)}
  initialWeight={2.0}
/>
```

## 📊 Data Structure

### ParcelRequest Interface
```typescript
interface ParcelRequest {
  estimatedFare: number;
  feeBreakdown: {
    baseFee: number;
    distanceFee: number;
    totalFee: number;
    distance: number;
    weightTier: string;
  };
  // ... other fields
}
```

### Station Data (Future)
```typescript
interface StationData {
  code: string;
  name: string;
  state: string;
  zone: string;
  latitude?: number;
  longitude?: number;
}

interface StationDistance {
  fromStation: string;
  toStation: string;
  distanceKm: number;
  route: string[];
}
```

## 🚀 Admin Features

### Station Data Upload
- **Excel Import**: Upload complete station database
- **Validation**: Automatic data validation and formatting
- **Updates**: Real-time fee calculation updates
- **Backup**: Automatic backup of existing data

### Fee Management
- **Tier Adjustment**: Modify weight tiers and pricing
- **Route Pricing**: Special pricing for specific routes
- **Bulk Updates**: Update multiple routes simultaneously
- **Analytics**: Fee calculation statistics and trends

## 🔄 Integration Points

### Create Parcel Request
1. User enters parcel details
2. **Real-time fee calculation** as user types
3. Fee breakdown displayed before submission
4. Fee locked in at request creation

### Carrier Dashboard
- View parcel requests with **confirmed fees**
- Fee breakdown visible in request details
- Payment processing based on calculated fees

### Wallet System
- Fees deducted from sender wallet
- Payments transferred to carrier after delivery
- **Escrow system** holds fees during transit

## 📈 Future Enhancements

### Planned Features
1. **Dynamic Pricing**: Peak hour and demand-based pricing
2. **Express Delivery**: Premium pricing for faster delivery
3. **Bulk Discounts**: Reduced rates for frequent senders
4. **Route Optimization**: Multiple route options with different costs
5. **Insurance**: Optional parcel insurance with additional fees

### API Integration
1. **Indian Railways API**: Live train schedules and delays
2. **Google Maps API**: Real-time distance calculations
3. **Payment Gateway**: Multiple payment options
4. **SMS/Email**: Fee notifications and confirmations

## 🎯 Business Logic

### Fee Validation
- **Weight Limits**: Enforce 10kg maximum for standard pricing
- **Distance Verification**: Validate station names and routes
- **Price Consistency**: Ensure consistent pricing across platform
- **Manual Override**: Admin ability to adjust specific fees

### Revenue Model
- **Platform Fee**: Small percentage added to calculated fee
- **Carrier Earnings**: Majority of fee goes to carrier
- **Operational Costs**: Platform maintenance and support costs

## 🔒 Security & Compliance

### Fee Protection
- **Locked Rates**: Fees cannot change after request creation
- **Audit Trail**: Complete history of fee calculations
- **Dispute Resolution**: Fee dispute handling mechanism
- **Transparency**: Clear fee breakdown for users

### Data Privacy
- **Encrypted Storage**: All fee data encrypted at rest
- **Access Control**: Role-based access to fee management
- **Compliance**: GDPR and local data protection compliance

---

**Note**: This system is designed to be **transparent, fair, and scalable**. The modular architecture allows for easy updates and enhancements as the platform grows.
