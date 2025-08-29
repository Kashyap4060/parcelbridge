# 🚀 Upload Station Data to Firestore via Command Line

## 📋 **Step-by-Step Setup Guide**

### **Step 1: Install Firebase Admin SDK**

Open Command Prompt in your project folder and run:
```bash
npm install firebase-admin
```

### **Step 2: Get Firebase Service Account Key**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Rename it to `firebase-service-account-key.json`
8. Place it in your project root folder (same folder as `package.json`)

### **Step 3: Prepare Your CSV File**

Your CSV file should have these columns:
- `train_no` - Train number
- `train_name` - Train name  
- `sequence` - Station sequence number
- `station_code` - Station code (e.g., SWV, MAO)
- `station_name` - Station name
- `distance_from_source` - Cumulative distance from source

Example:
```csv
train_no,train_name,sequence,station_code,station_name,distance_from_source
10103,MANDOVI EXPRESS,1,SWV,SAWANTWADI ROAD,0
10103,MANDOVI EXPRESS,2,MAO,MADGOAN JN,45
10103,MANDOVI EXPRESS,3,KRMI,KARMALI,62
```

### **Step 4: Upload Your Data**

Run one of these commands in your project folder:

#### Option A: Using NPM script
```bash
npm run upload-stations your-file.csv
```

#### Option B: Direct node command
```bash
node upload-stations.js your-file.csv
```

#### Example:
```bash
npm run upload-stations train-schedule.csv
```

### **Step 5: Verify Upload**

After successful upload, you'll see:
```
🎉 Upload completed successfully!
📍 Stations uploaded: 1234
🗺️ Distance pairs uploaded: 5678
✅ Your station data is now available in Firestore!
```

## 🔍 **What the Script Does**

1. **Reads your CSV file** and parses train schedule data
2. **Extracts unique stations** from all train routes
3. **Calculates distances** between all station pairs on each route
4. **Uploads to Firestore** in two collections:
   - `stations` - Contains all station data
   - `stationDistances` - Contains distance between station pairs

## 📊 **Firestore Collections Created**

### `stations` Collection
```javascript
{
  code: "SWV",
  name: "SAWANTWADI ROAD",
  createdAt: "2025-01-24T...",
  updatedAt: "2025-01-24T..."
}
```

### `stationDistances` Collection
```javascript
{
  fromStationCode: "SWV",
  fromStationName: "SAWANTWADI ROAD", 
  toStationCode: "MAO",
  toStationName: "MADGOAN JN",
  distanceKm: 45,
  trainNo: "10103",
  trainName: "MANDOVI EXPRESS",
  createdAt: "2025-01-24T...",
  updatedAt: "2025-01-24T..."
}
```

## 🔧 **Troubleshooting**

### Error: "File not found"
- Make sure your CSV file path is correct
- Use full path if needed: `npm run upload-stations C:\path\to\your\file.csv`

### Error: "Firebase Admin not initialized"
- Make sure you downloaded the service account key
- Rename it to `firebase-service-account-key.json`
- Place it in the project root folder

### Error: "Permission denied"
- Your Firebase service account needs Firestore write permissions
- Check your Firebase project permissions

### Large file processing
- The script processes files in batches of 500 records
- Large files may take several minutes to upload

## ✅ **After Upload**

Once uploaded successfully:
1. Your fee calculation system will automatically use real distance data
2. No more mock distances - all calculations will be accurate
3. You can verify the data in Firebase Console → Firestore Database

## 🎯 **Next Steps**

After successful upload, the platform will:
- Use real distance calculations for fee estimation
- Show accurate costs to users
- Support all station pairs from your data
- Fall back to estimated distances for routes not in your data

That's it! Your station data is now live and the platform will use it for accurate fee calculations.
