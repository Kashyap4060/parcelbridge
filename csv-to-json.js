#!/usr/bin/env node

// Convert CSV to JSON for Firebase import
const fs = require('fs');

function csvToFirebaseJson(csvFile, outputFile) {
  const csvContent = fs.readFileSync(csvFile, 'utf8');
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const firebaseData = {};
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Enhanced parsing to handle commas in values
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
    
    // Handle extra columns
    if (values.length > 12) {
      const extraParts = values.slice(4, values.length - 7);
      const mergedStationName = extraParts.join(',').replace(/,+$/, '');
      values.splice(4, extraParts.length, mergedStationName);
    }
    
    if (values.length >= 12) {
      const docId = `${values[0]}-${values[3]}-${values[2]}`;
      
      firebaseData[docId] = {
        train_no: values[0] || '',
        train_name: values[1] || '',
        sequence: parseInt(values[2]) || 0,
        station_code: values[3] || '',
        station_name: (values[4] || '').replace(/,+$/, ''),
        arrival_time: values[5] || '',
        departure_time: values[6] || '',
        distance_from_source: parseFloat(values[7]) || 0,
        source_station_code: values[8] || '',
        source_station_name: values[9] || '',
        destination_station_code: values[10] || '',
        destination_station_name: values[11] || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(firebaseData, null, 2));
  console.log(`✅ Converted ${Object.keys(firebaseData).length} records to ${outputFile}`);
}

// Usage
const csvFile = process.argv[2] || 'train_data.csv';
const jsonFile = process.argv[3] || 'train_data.json';

csvToFirebaseJson(csvFile, jsonFile);
