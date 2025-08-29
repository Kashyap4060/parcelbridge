#!/usr/bin/env node

// Train Data Upload Script for Firestore
// Run with: node upload-train-data.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account-key.json.json'); // Your service account key

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Enhanced CSV Parser that handles commas in fields
function parseTrainDataCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  console.log(`📋 Headers found: ${headers.length} columns`);
  console.log(`📋 Expected: train_no,train_name,sequence,station_code,station_name,arrival_time,departure_time,distance_from_source,source_station_code,source_station_name,destination_station_code,destination_station_name`);
  
  const data = [];
  let errorCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Split by comma but handle quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    
    // Handle rows with extra columns (merge into station_name)
    if (values.length > 12) {
      const extraParts = values.slice(4, values.length - 7);
      const mergedStationName = extraParts.join(',').replace(/,+$/, '');
      values.splice(4, extraParts.length, mergedStationName);
    }
    
    if (values.length >= 12) {
      try {
        data.push({
          train_no: values[0] || '',
          train_name: values[1] || '',
          sequence: parseInt(values[2]) || 0,
          station_code: values[3] || '',
          station_name: (values[4] || '').replace(/,+$/, ''), // Remove trailing commas
          arrival_time: values[5] || '',
          departure_time: values[6] || '',
          distance_from_source: parseFloat(values[7]) || 0,
          source_station_code: values[8] || '',
          source_station_name: values[9] || '',
          destination_station_code: values[10] || '',
          destination_station_name: values[11] || ''
        });
      } catch (error) {
        errorCount++;
        if (errorCount <= 5) {
          console.warn(`⚠️ Row ${i + 1} parsing error:`, error.message);
        }
      }
    } else {
      errorCount++;
      if (errorCount <= 5) {
        console.warn(`⚠️ Row ${i + 1} has ${values.length} columns, expected 12+`);
      }
    }
  }
  
  console.log(`✅ Parsed ${data.length} valid records, ${errorCount} errors`);
  return data;
}

// Upload data to Firestore in batches
async function uploadTrainData(trainData) {
  const BATCH_SIZE = 500;
  let uploadedCount = 0;
  
  console.log(`🚀 Starting upload of ${trainData.length} records in batches of ${BATCH_SIZE}...`);
  
  for (let i = 0; i < trainData.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const batchData = trainData.slice(i, i + BATCH_SIZE);
    
    batchData.forEach((record) => {
      const docId = `${record.train_no}-${record.station_code}-${record.sequence}`;
      const docRef = db.collection('train_data').doc(docId);
      
      batch.set(docRef, {
        ...record,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    try {
      await batch.commit();
      uploadedCount += batchData.length;
      console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(trainData.length / BATCH_SIZE)} completed. Total: ${uploadedCount}`);
    } catch (error) {
      console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
      throw error;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Log the upload
  await db.collection('data_upload_logs').add({
    type: 'train_data',
    recordCount: uploadedCount,
    uploadedAt: new Date(),
    status: 'success'
  });
  
  console.log(`🎉 Successfully uploaded ${uploadedCount} train records!`);
  return uploadedCount;
}

// Main execution
async function main() {
  try {
    const csvFile = process.argv[2] || 'train_data.csv';
    
    console.log(`📂 Reading file: ${csvFile}`);
    
    if (!fs.existsSync(csvFile)) {
      console.error(`❌ File not found: ${csvFile}`);
      console.log('Usage: node upload-train-data.js [csv-file-path]');
      process.exit(1);
    }
    
    const csvContent = fs.readFileSync(csvFile, 'utf8');
    console.log(`📊 File size: ${(csvContent.length / 1024 / 1024).toFixed(2)} MB`);
    
    const trainData = parseTrainDataCSV(csvContent);
    
    if (trainData.length === 0) {
      console.error('❌ No valid data found in CSV file');
      process.exit(1);
    }
    
    await uploadTrainData(trainData);
    
    console.log('✨ Upload completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Upload failed:', error);
    process.exit(1);
  }
}

main();
