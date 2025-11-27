# test_connection.py

import os
from qdrant_client import QdrantClient

# --- REPLACE THESE WITH YOUR EXACT CREDENTIALS ---
QDRANT_CLUSTER_URL = "https://c0baf843-3ec9-4f20-8edf-20bab064a1f0.eu-west-2-0.aws.cloud.qdrant.io"
QDRANT_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.OmPIIOLVkQ7XDmLCsCfZoDQinYYWL6C9SMbOqK5a-RA"

print("--- Running FINAL Qdrant Connection Test ---")

try:
    client = QdrantClient(url=QDRANT_CLUSTER_URL, api_key=QDRANT_API_KEY)
    
    # Attempt to list collections (this is a simple auth check)
    collections = client.get_collections()
    
    print("SUCCESS: Connection established.")
    print(f"Collections Found: {len(collections.collections)}")
    
    if len(collections.collections) == 0:
        print("\nACTION REQUIRED: No collections found. Connection is good, but collection creation is failing.")
    else:
        print(collections)

except Exception as e:
    print("\n--- CRITICAL ERROR DETECTED ---")
    print(f"Error Type: {type(e).__name__}")
    print(f"Full Error: {e}")
    print("\n--- FIX CREDENTIALS OR NETWORK ---")