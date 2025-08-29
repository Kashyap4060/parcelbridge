#!/usr/bin/env node

// Split large CSV into smaller chunks for easier processing
const fs = require('fs');

function splitCSV(inputFile, chunkSize = 10000) {
  const content = fs.readFileSync(inputFile, 'utf8');
  const lines = content.split('\n');
  const header = lines[0];
  
  let chunkIndex = 1;
  let currentChunk = [header];
  
  for (let i = 1; i < lines.length; i++) {
    currentChunk.push(lines[i]);
    
    if (currentChunk.length >= chunkSize + 1) { // +1 for header
      const chunkFile = `train_data_chunk_${chunkIndex}.csv`;
      fs.writeFileSync(chunkFile, currentChunk.join('\n'));
      console.log(`✅ Created ${chunkFile} with ${currentChunk.length - 1} records`);
      
      chunkIndex++;
      currentChunk = [header];
    }
  }
  
  // Write remaining records
  if (currentChunk.length > 1) {
    const chunkFile = `train_data_chunk_${chunkIndex}.csv`;
    fs.writeFileSync(chunkFile, currentChunk.join('\n'));
    console.log(`✅ Created ${chunkFile} with ${currentChunk.length - 1} records`);
  }
  
  console.log(`🎉 Split into ${chunkIndex} chunks`);
}

const inputFile = process.argv[2] || 'train_data.csv';
const chunkSize = parseInt(process.argv[3]) || 10000;

splitCSV(inputFile, chunkSize);
