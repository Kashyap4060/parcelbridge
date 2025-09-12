// Simple test script to add a few sample stations for testing the StationSelector
// Run this in browser console after logging in to test the functionality

const sampleStations = [
  {
    code: 'NDLS',
    name: 'NEW DELHI',
    state: 'Delhi',
    zone: 'NR',
    latitude: 28.6428,
    longitude: 77.2197
  },
  {
    code: 'CSMT',
    name: 'MUMBAI CST',
    state: 'Maharashtra', 
    zone: 'CR',
    latitude: 18.9398,
    longitude: 72.8355
  },
  {
    code: 'SBC',
    name: 'BANGALORE CITY',
    state: 'Karnataka',
    zone: 'SWR', 
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    code: 'MAS',
    name: 'CHENNAI CENTRAL',
    state: 'Tamil Nadu',
    zone: 'SR',
    latitude: 13.0827,
    longitude: 80.2707
  },
  {
    code: 'HWH',
    name: 'HOWRAH JN',
    state: 'West Bengal',
    zone: 'ER',
    latitude: 22.5726,
    longitude: 88.3639
  },
  {
    code: 'PUNE',
    name: 'PUNE JN',
    state: 'Maharashtra',
    zone: 'CR',
    latitude: 18.5204,
    longitude: 73.8567
  },
  {
    code: 'JP',
    name: 'JAIPUR',
    state: 'Rajasthan',
    zone: 'NWR',
    latitude: 26.9124,
    longitude: 75.7873
  },
  {
    code: 'KOAA',
    name: 'KOLKATA',
    state: 'West Bengal', 
    zone: 'ER',
    latitude: 22.5726,
    longitude: 88.3639
  }
];

// Function to add stations to Supabase
async function addSampleStations() {
  try {
    const { data, error } = await supabase
      .from('railway_stations')
      .insert(sampleStations);
      
    if (error) {
      console.error('Error adding stations:', error);
    } else {
      console.log('Successfully added sample stations:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sampleStations, addSampleStations };
} else {
  console.log('Sample stations ready. Call addSampleStations() to insert them.');
}
