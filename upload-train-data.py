#!/usr/bin/env python3

import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
import json
import sys
from datetime import datetime

def upload_train_data_python(csv_file):
    """Upload train data using Python and pandas"""
    
    # Initialize Firebase (you'll need your service account key)
    cred = credentials.Certificate('./firebase-service-account-key.json.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    
    print(f"📂 Reading CSV file: {csv_file}")
    
    # Read CSV with pandas (handles commas in fields better)
    try:
        df = pd.read_csv(csv_file, dtype=str, keep_default_na=False)
        print(f"✅ Loaded {len(df)} rows")
        print(f"📋 Columns: {list(df.columns)}")
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        return
    
    # Clean the data
    df = df.fillna('')  # Replace NaN with empty strings
    
    # Convert numeric columns
    df['sequence'] = pd.to_numeric(df['sequence'], errors='coerce').fillna(0).astype(int)
    df['distance_from_source'] = pd.to_numeric(df['distance_from_source'], errors='coerce').fillna(0)
    
    # Clean station names (remove trailing commas)
    df['station_name'] = df['station_name'].str.rstrip(',')
    
    print(f"🚀 Starting upload of {len(df)} records...")
    
    # Upload in batches
    batch_size = 500
    batch = db.batch()
    batch_count = 0
    uploaded_count = 0
    
    for index, row in df.iterrows():
        # Create document ID
        doc_id = f"{row['train_no']}-{row['station_code']}-{row['sequence']}"
        doc_ref = db.collection('train_data').document(doc_id)
        
        # Prepare data
        data = row.to_dict()
        data['createdAt'] = datetime.now()
        data['updatedAt'] = datetime.now()
        
        batch.set(doc_ref, data)
        batch_count += 1
        
        # Commit batch when it reaches batch_size
        if batch_count >= batch_size:
            try:
                batch.commit()
                uploaded_count += batch_count
                print(f"✅ Batch completed. Total uploaded: {uploaded_count}")
                batch = db.batch()
                batch_count = 0
            except Exception as e:
                print(f"❌ Batch upload failed: {e}")
                return
    
    # Commit remaining records
    if batch_count > 0:
        try:
            batch.commit()
            uploaded_count += batch_count
            print(f"✅ Final batch completed. Total uploaded: {uploaded_count}")
        except Exception as e:
            print(f"❌ Final batch upload failed: {e}")
            return
    
    # Log the upload
    db.collection('data_upload_logs').add({
        'type': 'train_data',
        'recordCount': uploaded_count,
        'uploadedAt': datetime.now(),
        'status': 'success'
    })
    
    print(f"🎉 Successfully uploaded {uploaded_count} train records!")

if __name__ == "__main__":
    csv_file = sys.argv[1] if len(sys.argv) > 1 else 'train_data.csv'
    upload_train_data_python(csv_file)
