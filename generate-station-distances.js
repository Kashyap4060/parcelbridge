#!/usr/bin/env node

/**
 * Generate Station Distances from Train Data
 * Creates station-to-station distance mappings from train route data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateStationDistances() {
  try {
    console.log('🚂 Starting station distance generation...');
    
    // Read train data CSV
    const csvContent = fs.readFileSync('./train_data.csv', 'utf-8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    console.log(`📋 Processing ${lines.length - 1} train route records...`);
    
    const distanceMap = new Map();
    const trainRoutes = new Map();
    
    // Parse train data and build route maps
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < 12) continue;
      
      const trainNo = values[0]?.trim();
      const trainName = values[1]?.trim();
      const sequence = parseInt(values[2]?.trim());
      const stationCode = values[3]?.trim();
      const stationName = values[4]?.trim();
      const distanceFromSource = parseFloat(values[7]?.trim()) || 0;
      
      if (!trainNo || !stationCode) continue;
      
      // Group stations by train
      if (!trainRoutes.has(trainNo)) {
        trainRoutes.set(trainNo, {
          trainName,
          stations: []
        });
      }
      
      trainRoutes.get(trainNo).stations.push({
        sequence,
        code: stationCode,
        name: stationName,
        distance: distanceFromSource
      });
    }
    
    console.log(`🔄 Processing ${trainRoutes.size} unique trains...`);
    
    // Calculate distances between stations
    let distanceCount = 0;
    
    for (const [trainNo, route] of trainRoutes) {
      // Sort stations by sequence
      route.stations.sort((a, b) => a.sequence - b.sequence);
      
      // Calculate distances between all station pairs in this route
      for (let i = 0; i < route.stations.length; i++) {
        for (let j = i + 1; j < route.stations.length; j++) {
          const fromStation = route.stations[i];
          const toStation = route.stations[j];
          
          const distance = Math.abs(toStation.distance - fromStation.distance);
          
          if (distance > 0) {
            const key1 = `${fromStation.code}-${toStation.code}`;
            const key2 = `${toStation.code}-${fromStation.code}`;
            
            // Store the shortest distance for this station pair
            const existing = distanceMap.get(key1) || distanceMap.get(key2);
            if (!existing || distance < existing.distance) {
              distanceMap.set(key1, {
                fromCode: fromStation.code,
                fromName: fromStation.name,
                toCode: toStation.code,
                toName: toStation.name,
                distance: distance,
                trainNo: trainNo,
                trainName: route.trainName
              });
            }
          }
        }
      }
      
      if (distanceCount % 100 === 0) {
        console.log(`📍 Processed ${distanceCount} trains, found ${distanceMap.size} unique station pairs`);
      }
      distanceCount++;
    }
    
    console.log(`✅ Generated ${distanceMap.size} station distance records`);
    
    // Convert to array for batch insert
    const distanceRecords = Array.from(distanceMap.values()).map(record => ({
      from_station_code: record.fromCode,
      from_station_name: record.fromName,
      to_station_code: record.toCode,
      to_station_name: record.toName,
      distance_km: record.distance,
      train_no: record.trainNo,
      train_name: record.trainName
    }));
    
    console.log(`💾 Uploading ${distanceRecords.length} records to Supabase...`);
    
    // Insert in batches of 1000
    const batchSize = 1000;
    let uploaded = 0;
    
    for (let i = 0; i < distanceRecords.length; i += batchSize) {
      const batch = distanceRecords.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('station_distances')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error uploading batch ${i / batchSize + 1}:`, error);
        continue;
      }
      
      uploaded += batch.length;
      console.log(`📤 Uploaded ${uploaded}/${distanceRecords.length} records (${Math.round(uploaded/distanceRecords.length*100)}%)`);
    }
    
    console.log('🎉 Station distances generated successfully!');
    console.log(`📊 Total records: ${uploaded}`);
    
    // Test a few sample distance queries
    console.log('\n🧪 Testing distance queries...');
    
    const testQueries = [
      ['NDLS', 'BCT'], // Delhi to Mumbai
      ['MAS', 'SBC'],  // Chennai to Bangalore
      ['HWH', 'NDLS']  // Howrah to Delhi
    ];
    
    for (const [from, to] of testQueries) {
      const { data, error } = await supabase
        .from('station_distances')
        .select('distance_km, train_name')
        .or(`and(from_station_code.eq.${from},to_station_code.eq.${to}),and(from_station_code.eq.${to},to_station_code.eq.${from})`)
        .single();
      
      if (data) {
        console.log(`📏 ${from} ↔ ${to}: ${data.distance_km} km (via ${data.train_name})`);
      } else {
        console.log(`❌ No distance found for ${from} ↔ ${to}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error generating station distances:', error);
  }
}

// Run the script
generateStationDistances();