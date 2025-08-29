// Test station lookup functionality
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDI0-WbUjBMDn8KCr5vVhWTNfn-qe1rK6o",
  authDomain: "parcelbridge-1a5b4.firebaseapp.com",
  projectId: "parcelbridge-1a5b4",
  storageBucket: "parcelbridge-1a5b4.firebasestorage.app",
  messagingSenderId: "977754495300",
  appId: "1:977754495300:web:b81d29e42c6d3d56b97a35"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testStationLookup() {
  try {
    console.log('Testing station lookup...');
    
    const trainDataRef = collection(db, 'train_data');
    
    // Test with NDLS (NEW DELHI)
    const ndlsQuery = query(trainDataRef, where('station_code', '==', 'NDLS'), limit(1));
    const ndlsSnapshot = await getDocs(ndlsQuery);
    
    if (!ndlsSnapshot.empty) {
      const ndlsData = ndlsSnapshot.docs[0].data();
      console.log('NDLS found:', {
        station_code: ndlsData.station_code,
        station_name: ndlsData.station_name,
        train_no: ndlsData.train_no
      });
    } else {
      console.log('NDLS not found');
    }
    
    // Test with SV 
    const svQuery = query(trainDataRef, where('station_code', '==', 'SV'), limit(1));
    const svSnapshot = await getDocs(svQuery);
    
    if (!svSnapshot.empty) {
      const svData = svSnapshot.docs[0].data();
      console.log('SV found:', {
        station_code: svData.station_code,
        station_name: svData.station_name,
        train_no: svData.train_no
      });
    } else {
      console.log('SV not found');
    }
    
    // Test with LTT
    const lttQuery = query(trainDataRef, where('station_code', '==', 'LTT'), limit(1));
    const lttSnapshot = await getDocs(lttQuery);
    
    if (!lttSnapshot.empty) {
      const lttData = lttSnapshot.docs[0].data();
      console.log('LTT found:', {
        station_code: lttData.station_code,
        station_name: lttData.station_name,
        train_no: lttData.train_no
      });
    } else {
      console.log('LTT not found');
    }
    
  } catch (error) {
    console.error('Error testing station lookup:', error);
  }
}

export default testStationLookup;
