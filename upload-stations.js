#!/usr/bin/env node

// Station Data Upload Script for Firestore
// Run with: node upload-stations.js your-file.csv

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
// You'll need to download your service account key from Firebase Console
const serviceAccount = require('./firebase-service-account-key.json'); // You'll need to add this file

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// CSV Parser
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      
      // Convert specific fields to numbers
      if (header === 'sequence' || header === 'distance_from_source') {
        row[header] = parseInt(value) || 0;
      } else {
        row[header] = value;
      }
    });
    
    return row;
  });
}

// Process train schedule data to extract stations and distances
function processTrainScheduleData(scheduleData) {
  const stations = new Map();
  const distances = new Map();

  console.log(`📊 Processing ${scheduleData.length} train schedule records...`);

  // Group by train
  const trainGroups = new Map();
  scheduleData.forEach(row => {
    if (!trainGroups.has(row.train_no)) {
      trainGroups.set(row.train_no, []);
    }
    trainGroups.get(row.train_no).push(row);
  });

  console.log(`🚂 Found ${trainGroups.size} unique trains`);

  // Process each train route
  trainGroups.forEach((trainRoute, trainNo) => {
    // Sort stations by sequence
    trainRoute.sort((a, b) => a.sequence - b.sequence);

    // Extract unique stations
    trainRoute.forEach(station => {
      if (station.station_code && station.station_name) {
        stations.set(station.station_code, {
          code: station.station_code,
          name: station.station_name,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    // Calculate distances between all station pairs on this route
    for (let i = 0; i < trainRoute.length; i++) {
      for (let j = i + 1; j < trainRoute.length; j++) {
        const fromStation = trainRoute[i];
        const toStation = trainRoute[j];
        
        const distance = toStation.distance_from_source - fromStation.distance_from_source;
        
        if (distance > 0) {
          const key = `${fromStation.station_code}_${toStation.station_code}`;
          const reverseKey = `${toStation.station_code}_${fromStation.station_code}`;
          
          // Only add if not already exists (to avoid duplicates)
          if (!distances.has(key) && !distances.has(reverseKey)) {
            distances.set(key, {
              fromStationCode: fromStation.station_code,
              fromStationName: fromStation.station_name,
              toStationCode: toStation.station_code,
              toStationName: toStation.station_name,
              distanceKm: distance,
              trainNo: trainNo,
              trainName: trainRoute[0].train_name,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      }
    }
  });

  return {
    stations: Array.from(stations.values()),
    distances: Array.from(distances.values())
  };
}

// Upload stations to Firestore
async function uploadStations(stations) {
  console.log(`📍 Uploading ${stations.length} stations to Firestore...`);
  
  let uploadedCount = 0;
  const batchSize = 500;

  // Process in chunks of 500
  for (let i = 0; i < stations.length; i += batchSize) {
    const batch = db.batch(); // Create new batch for each chunk
    const chunk = stations.slice(i, i + batchSize);
    
    chunk.forEach(station => {
      const docRef = db.collection('stations').doc(station.code);
      batch.set(docRef, station, { merge: true });
    });
    
    await batch.commit();
    uploadedCount += chunk.length;
    console.log(`✅ Uploaded ${uploadedCount} stations...`);
  }

  console.log(`✅ Successfully uploaded ${uploadedCount} stations`);
  return uploadedCount;
}

// Upload distances to Firestore
async function uploadDistances(distances) {
  console.log(`🗺️ Uploading ${distances.length} distance pairs to Firestore...`);
  
  let uploadedCount = 0;
  const batchSize = 500;

  // Process in chunks of 500
  for (let i = 0; i < distances.length; i += batchSize) {
    const batch = db.batch(); // Create new batch for each chunk
    const chunk = distances.slice(i, i + batchSize);
    
    chunk.forEach(distance => {
      const docRef = db.collection('stationDistances').doc();
      batch.set(docRef, distance);
    });
    
    await batch.commit();
    uploadedCount += chunk.length;
    console.log(`✅ Uploaded ${uploadedCount} distance pairs...`);
  }

  console.log(`✅ Successfully uploaded ${uploadedCount} distance pairs`);
  return uploadedCount;
}

// Main upload function
async function uploadStationData(csvFilePath) {
  try {
    console.log('🚀 Starting station data upload...');
    console.log(`📁 Reading file: ${csvFilePath}`);

    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`File not found: ${csvFilePath}`);
    }

    // Read and parse CSV
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const scheduleData = parseCSV(csvContent);
    
    console.log(`📊 Parsed ${scheduleData.length} records from CSV`);

    // Process data
    const { stations, distances } = processTrainScheduleData(scheduleData);
    
    console.log(`📍 Extracted ${stations.length} unique stations`);
    console.log(`🗺️ Calculated ${distances.length} distance pairs`);

    // Upload to Firestore
    const stationsUploaded = await uploadStations(stations);
    const distancesUploaded = await uploadDistances(distances);

    console.log('\n🎉 Upload completed successfully!');
    console.log(`📍 Stations uploaded: ${stationsUploaded}`);
    console.log(`🗺️ Distance pairs uploaded: ${distancesUploaded}`);
    console.log('\n✅ Your station data is now available in Firestore!');
    console.log('💡 The fee calculation system will now use real distance data.');

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('\n📋 Station Data Upload Script');
  console.log('Usage: node upload-stations.js <csv-file-path>');
  console.log('Example: node upload-stations.js train-schedule.csv');
  console.log('\n📝 Required CSV columns:');
  console.log('  - train_no');
  console.log('  - train_name');
  console.log('  - sequence');
  console.log('  - station_code');
  console.log('  - station_name');
  console.log('  - distance_from_source');
  process.exit(1);
}

// Run the upload
uploadStationData(args[0]);
