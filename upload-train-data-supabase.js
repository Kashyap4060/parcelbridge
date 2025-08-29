#!/usr/bin/env node

/**
 * Train Data Upload Script for Supabase
 * Uploads train_data.csv to Supabase PostgreSQL database
 * Run with: node upload-train-data-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
  console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse CSV with proper handling of commas and quotes
function parseTrainDataCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  console.log(`📋 Headers found: ${headers.join(', ')}`);
  
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
    
    try {
      // Helper function to clean time values
      const cleanTimeValue = (timeStr) => {
        if (!timeStr || timeStr === 'NA' || timeStr === '00:00:00' || timeStr.trim() === '') {
          return null;
        }
        // Validate time format (HH:MM:SS)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        return timeRegex.test(timeStr.trim()) ? timeStr.trim() : null;
      };

      // Map CSV columns to Supabase table structure
      const trainRecord = {
        train_no: values[0] || '',
        train_name: values[1] || '',
        sequence: parseInt(values[2]) || 0,
        station_code: values[3] || '',
        station_name: values[4] || '',
        arrival_time: cleanTimeValue(values[5]),
        departure_time: cleanTimeValue(values[6]),
        distance_km: parseFloat(values[7]) || 0,
        // Note: source/destination info from CSV is not stored in main table
        // but could be derived from sequence 1 and last sequence
      };
      
      // Validate required fields
      if (trainRecord.train_no && trainRecord.station_code && trainRecord.sequence > 0) {
        data.push(trainRecord);
      } else {
        console.warn(`⚠️  Skipping invalid record at line ${i + 1}: missing required fields`);
        errorCount++;
      }
    } catch (error) {
      console.warn(`⚠️  Error parsing line ${i + 1}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`✅ Parsed ${data.length} valid records`);
  if (errorCount > 0) {
    console.log(`⚠️  Skipped ${errorCount} invalid records`);
  }
  
  return data;
}

// Upload data to Supabase in batches
async function uploadTrainData(data) {
  const batchSize = 1000; // Supabase handles larger batches well
  const totalBatches = Math.ceil(data.length / batchSize);
  let successCount = 0;
  let errorCount = 0;
  
  console.log(`🚀 Starting upload of ${data.length} records in ${totalBatches} batches...`);
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, data.length);
    const batch = data.slice(start, end);
    
    try {
      console.log(`📤 Uploading batch ${i + 1}/${totalBatches} (${batch.length} records)...`);
      
      const { data: result, error } = await supabase
        .from('train_data')
        .upsert(batch, { 
          onConflict: 'train_no,station_code,sequence',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ Error uploading batch ${i + 1}:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`✅ Batch ${i + 1} uploaded successfully`);
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Unexpected error in batch ${i + 1}:`, error.message);
      errorCount += batch.length;
    }
  }
  
  return { successCount, errorCount };
}

// Also populate railway_stations table with unique stations
async function populateStations(trainData) {
  console.log('🚂 Extracting unique stations...');
  
  const stationsMap = new Map();
  
  trainData.forEach(record => {
    if (!stationsMap.has(record.station_code)) {
      stationsMap.set(record.station_code, {
        code: record.station_code,
        name: record.station_name,
        created_at: new Date().toISOString()
      });
    }
  });
  
  const stations = Array.from(stationsMap.values());
  console.log(`📍 Found ${stations.length} unique stations`);
  
  // Upload stations in batches
  const batchSize = 500;
  const totalBatches = Math.ceil(stations.length / batchSize);
  let stationSuccessCount = 0;
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, stations.length);
    const batch = stations.slice(start, end);
    
    try {
      console.log(`📤 Uploading station batch ${i + 1}/${totalBatches} (${batch.length} stations)...`);
      
      const { error } = await supabase
        .from('railway_stations')
        .upsert(batch, { 
          onConflict: 'code',
          ignoreDuplicates: true 
        });
      
      if (error) {
        console.warn(`⚠️  Some stations in batch ${i + 1} may have failed:`, error.message);
      } else {
        stationSuccessCount += batch.length;
        console.log(`✅ Station batch ${i + 1} uploaded successfully`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (error) {
      console.error(`❌ Error uploading station batch ${i + 1}:`, error.message);
    }
  }
  
  console.log(`📍 Processed ${stationSuccessCount} stations`);
}

// Main execution
async function main() {
  try {
    console.log('🚀 Train Data Upload to Supabase Started');
    console.log('=' .repeat(50));
    
    // Check if CSV file exists
    const csvPath = path.join(__dirname, 'train_data.csv');
    if (!fs.existsSync(csvPath)) {
      console.error('❌ train_data.csv file not found!');
      process.exit(1);
    }
    
    // Read and parse CSV
    console.log('📖 Reading CSV file...');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const trainData = parseTrainDataCSV(csvContent);
    
    if (trainData.length === 0) {
      console.error('❌ No valid train data found in CSV file');
      process.exit(1);
    }
    
    // Test database connection
    console.log('🔌 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('train_data')
      .select('*', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Failed to connect to Supabase:', testError.message);
      process.exit(1);
    }
    
    console.log('✅ Supabase connection successful');
    
    // Upload stations first
    await populateStations(trainData);
    
    // Upload train data
    const result = await uploadTrainData(trainData);
    
    // Summary
    console.log('\\n' + '=' .repeat(50));
    console.log('📊 UPLOAD SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ Successfully uploaded: ${result.successCount} records`);
    console.log(`❌ Failed uploads: ${result.errorCount} records`);
    console.log(`📈 Success rate: ${((result.successCount / trainData.length) * 100).toFixed(2)}%`);
    
    if (result.successCount > 0) {
      console.log('\\n🎉 Train data upload completed successfully!');
      console.log('📍 Station search and distance calculations are now enabled.');
    } else {
      console.log('\\n⚠️  Upload completed with errors. Please check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
