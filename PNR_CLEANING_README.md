# PNR API Response Cleaning System

A comprehensive TypeScript system for cleaning and standardizing Indian Railways PNR API responses.

## 📁 File Structure

```
src/
├── types/PNR.ts                          # TypeScript interfaces
├── lib/pnrService.ts                     # Main service functions
└── examples/pnr-cleaning-examples.ts     # Usage examples
```

## 🎯 Output Format

The system transforms any raw PNR API response into this exact structure:

```json
{
  "Train Details": {
    "trainNumber": "11061",
    "trainName": "LTT JAYNAGAR EXP"
  },
  "Route Information": {
    "fromStation": "Lokmanya Tilak Terminus",
    "toStation": "Varanasi Junction"
  },
  "Schedule": {
    "departureDate": "2025-02-09",
    "departureTime": "11:30 AM",
    "arrivalDate": "2025-02-10",
    "arrivalTime": "8:25 AM"
  },
  "Seat Information": [
    {
      "coachType": "Sleeper",
      "coachNumber": "S4",
      "seatNumber": "35"
    }
  ]
}
```

## 🚀 Usage

### Basic Usage

```typescript
import { transformRawPNRResponse } from '@/lib/pnrService';

const rawResponse = {
  status: true,
  data: {
    trainNumber: "11061",
    trainName: "LTT JAYNAGAR EXP",
    // ... other fields
  }
};

const cleaned = transformRawPNRResponse(rawResponse);
console.log(cleaned);
```

### API Integration

```typescript
import { getPNRStatus, validatePNRNumber } from '@/lib/pnrService';

async function fetchPNR(pnrNumber: string, apiKey: string) {
  // Validate format
  const validation = validatePNRNumber(pnrNumber);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  // Fetch and clean
  const result = await getPNRStatus(pnrNumber, apiKey);
  return result;
}
```

## ✨ Features

### 🔄 Format Transformation
- Converts raw API responses to standardized format
- Handles multiple API response structures
- Maps various field names to consistent keys

### ⏰ Time Formatting
- Automatically formats times to `hh:mm AM/PM`
- Handles 24-hour format (HH:MM, HHMM)
- Preserves existing AM/PM format

### 🛡️ Type Safety
- Full TypeScript support
- Strict interface definitions
- Compile-time error checking

### 🧪 Error Handling
- Graceful handling of missing fields
- Detailed error messages
- Fallback to empty strings for missing data

## 📝 Supported API Response Formats

The system can handle various API response structures:

### Standard Format
```json
{
  "status": true,
  "data": {
    "trainNumber": "11061",
    "boardingInfo": { "stationName": "LTT", "departureTime": "1130" },
    "passengerInfo": [{ "coachName": "SL", "berthNumber": "35" }]
  }
}
```

### Alternative Format 1
```json
{
  "success": true,
  "result": {
    "train_number": "11061",
    "fromStation": "LTT",
    "passengers": [{ "coach_type": "SL", "seat_number": "35" }]
  }
}
```

### Alternative Format 2
```json
{
  "pnrDetails": {
    "trainNo": "11061",
    "origin": "LTT",
    "passengerList": [{ "class": "SL", "seatNo": "35" }]
  }
}
```

## 🔧 Configuration

### Environment Variables
```env
RAPIDAPI_KEY=your_rapidapi_key_here
```

### Development Mode
In development, the system can use mock data:
```typescript
const result = await getPNRData(pnrNumber, true); // Allow mock
```

## 📊 Example Output

For PNR `1234567890`, the system will output:

```json
{
  "Train Details": {
    "trainNumber": "11061",
    "trainName": "LTT JAYNAGAR EXP"
  },
  "Route Information": {
    "fromStation": "LTT",
    "toStation": "BSB"
  },
  "Schedule": {
    "departureDate": "2025-02-09",
    "departureTime": "11:30 AM",
    "arrivalDate": "2024-11-30",
    "arrivalTime": "12:25 PM"
  },
  "Seat Information": [
    {
      "coachType": "sleeper",
      "coachNumber": "S4",
      "seatNumber": "35"
    }
  ]
}
```

## 🎮 Testing

Run the examples:
```bash
npm run dev
# Navigate to examples in your code
```

## 📚 API Reference

### `transformRawPNRResponse(rawResponse: any)`
Transforms any raw API response into standardized format.

### `getPNRStatus(pnrNumber: string, apiKey: string)`
Fetches PNR data from API and returns cleaned response.

### `validatePNRNumber(pnrNumber: string)`
Validates PNR number format (10 digits).

### `formatTime(timeString: string)`
Formats time strings to `hh:mm AM/PM` format.

---

## 🔄 Legacy Compatibility

The system includes compatibility functions for existing code:
- `validatePNRFormat` → `validatePNRNumber`
- `getPNRData` → Mock-compatible version
- `extractTimeInfo` → Time extraction utility

Perfect for integration with existing Parcel-Bridge components! 🚀
