/**
 * Firebase to Supabase Data Migration Script
 * 
 * This script helps migrate data from Firebase Firestore to Supabase PostgreSQL
 * 
 * Usage:
 * 1. Set up both Firebase and Supabase credentials
 * 2. Run: node migrate-data.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Firebase configuration (from your .env.local)
const firebaseConfig = {
  apiKey: "AIzaSyDs2IZQTkdLgixue39Z2GpC3hB0gzj3lz4",
  authDomain: "parcel-bridge-4088.firebaseapp.com",
  projectId: "parcel-bridge-4088",
  storageBucket: "parcel-bridge-4088.firebasestorage.app",
  messagingSenderId: "411262188769",
  appId: "1:411262188769:web:854dc9678e1d9f8d26cba0"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

// Initialize Supabase (you'll need to add your credentials)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Migration functions
async function migrateUsers() {
  console.log('🔄 Migrating users...');
  
  try {
    const usersCollection = collection(firestore, 'users');
    const snapshot = await getDocs(usersCollection);
    
    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email,
        phone: data.phone,
        display_name: data.displayName || data.name,
        role: data.role || 'sender',
        is_phone_verified: data.isPhoneVerified || false,
        is_aadhaar_verified: data.isAadhaarVerified || false,
        avatar_url: data.photoURL,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        aadhaar_number: data.aadhaarNumber,
        aadhaar_name: data.aadhaarName,
        wallet_balance: data.walletBalance || 0,
        locked_amount: data.lockedAmount || 0,
        created_at: data.createdAt?.toDate?.() || new Date(),
        updated_at: data.updatedAt?.toDate?.() || new Date(),
        last_login: data.lastLogin?.toDate?.()
      });
    });

    if (users.length > 0) {
      const { data, error } = await supabase
        .from('users')
        .upsert(users, { onConflict: 'id' });

      if (error) {
        console.error('❌ Error migrating users:', error);
      } else {
        console.log(`✅ Migrated ${users.length} users`);
      }
    }
  } catch (error) {
    console.error('❌ Error in user migration:', error);
  }
}

async function migrateStations() {
  console.log('🔄 Migrating railway stations...');
  
  try {
    const stationsCollection = collection(firestore, 'stations');
    const snapshot = await getDocs(stationsCollection);
    
    const stations = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      stations.push({
        code: data.code,
        name: data.name,
        state: data.state,
        zone: data.zone,
        latitude: data.latitude,
        longitude: data.longitude,
        created_at: data.createdAt?.toDate?.() || new Date(),
        updated_at: data.updatedAt?.toDate?.() || new Date()
      });
    });

    if (stations.length > 0) {
      // Insert in batches to avoid timeout
      const batchSize = 1000;
      for (let i = 0; i < stations.length; i += batchSize) {
        const batch = stations.slice(i, i + batchSize);
        const { error } = await supabase
          .from('railway_stations')
          .upsert(batch, { onConflict: 'code' });

        if (error) {
          console.error('❌ Error migrating stations batch:', error);
        } else {
          console.log(`✅ Migrated stations ${i + 1} to ${Math.min(i + batchSize, stations.length)}`);
        }
      }
      console.log(`✅ Migrated ${stations.length} railway stations`);
    }
  } catch (error) {
    console.error('❌ Error in stations migration:', error);
  }
}

async function migrateTrainData() {
  console.log('🔄 Migrating train data...');
  
  try {
    const trainDataCollection = collection(firestore, 'train_data');
    const snapshot = await getDocs(trainDataCollection);
    
    const trainData = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      trainData.push({
        train_no: data.train_no,
        train_name: data.train_name,
        station_code: data.station_code,
        station_name: data.station_name,
        sequence: data.sequence,
        arrival_time: data.arrival_time,
        departure_time: data.departure_time,
        halt_minutes: data.halt || 0,
        distance_km: data.distance_km,
        day: data.day,
        created_at: data.createdAt?.toDate?.() || new Date()
      });
    });

    if (trainData.length > 0) {
      // Insert in batches
      const batchSize = 1000;
      for (let i = 0; i < trainData.length; i += batchSize) {
        const batch = trainData.slice(i, i + batchSize);
        const { error } = await supabase
          .from('train_data')
          .upsert(batch, { onConflict: 'train_no,station_code,sequence' });

        if (error) {
          console.error('❌ Error migrating train data batch:', error);
        } else {
          console.log(`✅ Migrated train data ${i + 1} to ${Math.min(i + batchSize, trainData.length)}`);
        }
      }
      console.log(`✅ Migrated ${trainData.length} train data records`);
    }
  } catch (error) {
    console.error('❌ Error in train data migration:', error);
  }
}

async function migrateParcelRequests() {
  console.log('🔄 Migrating parcel requests...');
  
  try {
    const parcelsCollection = collection(firestore, 'parcelRequests');
    const snapshot = await getDocs(parcelsCollection);
    
    const parcels = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      parcels.push({
        id: doc.id,
        sender_id: data.senderUid,
        carrier_id: data.carrierUid,
        pickup_station: data.pickupStation,
        pickup_station_code: data.pickupStationCode || extractStationCode(data.pickupStation),
        drop_station: data.dropStation,
        drop_station_code: data.dropStationCode || extractStationCode(data.dropStation),
        weight: data.weight,
        length: data.dimensions?.length,
        width: data.dimensions?.width,
        height: data.dimensions?.height,
        description: data.description,
        pickup_time: data.pickupTime?.toDate?.() || new Date(),
        estimated_fare: data.estimatedFare || 0,
        payment_held: data.paymentHeld || 0,
        fee_breakdown: data.feeBreakdown ? JSON.stringify(data.feeBreakdown) : null,
        status: data.status?.toUpperCase() || 'PENDING',
        otp_code: data.otpCode,
        accepted_at: data.acceptedAt?.toDate?.(),
        otp_verified_at: data.otpVerifiedAt?.toDate?.(),
        delivered_at: data.deliveredAt?.toDate?.(),
        created_at: data.createdAt?.toDate?.() || new Date(),
        updated_at: data.updatedAt?.toDate?.() || new Date()
      });
    });

    if (parcels.length > 0) {
      const { error } = await supabase
        .from('parcel_requests')
        .upsert(parcels, { onConflict: 'id' });

      if (error) {
        console.error('❌ Error migrating parcel requests:', error);
      } else {
        console.log(`✅ Migrated ${parcels.length} parcel requests`);
      }
    }
  } catch (error) {
    console.error('❌ Error in parcel requests migration:', error);
  }
}

async function migrateJourneys() {
  console.log('🔄 Migrating train journeys...');
  
  try {
    const journeysCollection = collection(firestore, 'trainJourneys');
    const snapshot = await getDocs(journeysCollection);
    
    const journeys = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      journeys.push({
        id: doc.id,
        carrier_id: data.carrierUid,
        pnr: data.pnr,
        train_number: data.trainNumber,
        train_name: data.trainName,
        source_station: data.sourceStation,
        source_station_code: data.sourceStationCode,
        destination_station: data.destinationStation,
        destination_station_code: data.destinationStationCode,
        stations: data.stations || [],
        journey_date: data.journeyDate?.toDate?.() || new Date(),
        departure_time: data.departureTime,
        arrival_time: data.arrivalTime,
        arrival_date: data.arrivalDate?.toDate?.(),
        coach_number: data.coachNumber,
        seat_number: data.seatNumber,
        class: data.class,
        is_active: data.isActive !== false,
        created_at: data.createdAt?.toDate?.() || new Date(),
        updated_at: data.updatedAt?.toDate?.() || new Date()
      });
    });

    if (journeys.length > 0) {
      const { error } = await supabase
        .from('train_journeys')
        .upsert(journeys, { onConflict: 'id' });

      if (error) {
        console.error('❌ Error migrating journeys:', error);
      } else {
        console.log(`✅ Migrated ${journeys.length} train journeys`);
      }
    }
  } catch (error) {
    console.error('❌ Error in journeys migration:', error);
  }
}

// Helper function to extract station code from station name
function extractStationCode(stationName) {
  // This is a simple extraction - you may need to improve it
  if (typeof stationName !== 'string') return '';
  
  // Common patterns for station codes in names
  const match = stationName.match(/\(([A-Z]{2,5})\)/);
  return match ? match[1] : stationName.substring(0, 4).toUpperCase();
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting Firebase to Supabase migration...\n');
  
  try {
    await migrateUsers();
    await migrateStations();
    await migrateTrainData();
    await migrateParcelRequests();
    await migrateJourneys();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your application to use Supabase auth provider');
    console.log('2. Test all functionality');
    console.log('3. Update webhook URLs in Razorpay dashboard');
    console.log('4. Deploy your application');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Export for use as module or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export {
  migrateUsers,
  migrateStations,
  migrateTrainData,
  migrateParcelRequests,
  migrateJourneys,
  runMigration
};
