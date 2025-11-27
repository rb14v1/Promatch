import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import PointStruct
from django.conf import settings

qdrant_client = QdrantClient(
    url=settings.QDRANT_CLUSTER_URL,
    api_key=settings.QDRANT_API_KEY
)

COLLECTION_NAME = "resume_collection"
VECTOR_SIZE = 384  # ✅ must match MiniLM embedding size
 
def initialize_qdrant_collection():
    try:
        qdrant_client.get_collection(collection_name=COLLECTION_NAME)
        print(f"✅ Collection '{COLLECTION_NAME}' exists.")
    except Exception:
        print(f"⚠️ Collection '{COLLECTION_NAME}' not found. Creating...")
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=VECTOR_SIZE,
                distance=models.Distance.COSINE
            )
        )
        print(f"✅ Collection '{COLLECTION_NAME}' created.")
 
    # Index on experience_years
    try:
        qdrant_client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="experience_years",
            field_schema=models.PayloadSchemaType.INTEGER
        )
        print("✅ Payload index for 'experience_years' created/verified.")
    except Exception as e:
        if "already exists" not in str(e):
            print(f"⚠️ Index creation failed: {e}")
 
    # 🔹 NEW: Index on department (keyword/string filter)
    try:
        qdrant_client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="department",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        print("✅ Payload index for 'department' created/verified.")
    except Exception as e:
        if "already exists" not in str(e):
            print(f"⚠️ Index creation failed for department: {e}")
 
 
 
# --- Upsert Point ---
def upsert_point(point_id, vector, payload):
    initialize_qdrant_collection()
 
    if not vector or len(vector) != VECTOR_SIZE:
        raise ValueError(f"Embedding size mismatch: got {len(vector)} expected {VECTOR_SIZE}")
 
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[PointStruct(id=point_id, vector=vector, payload=payload)],
        wait=True
    )
 
 
# --- Search Collection ---
def search_collection(query_vector, query_filter=None, limit=10, min_score=0.30):
    """
    Search Qdrant collection.
    Applies a score filter (min_score), returns fallback if nothing passes.
    """
    initialize_qdrant_collection()
 
    if not query_vector or len(query_vector) != VECTOR_SIZE:
        raise ValueError(f"Invalid query vector size: {len(query_vector)} (expected {VECTOR_SIZE})")
 
    try:
        print("🔎 Searching Qdrant...")
        print(f"Query vector length: {len(query_vector)}")
        print(f"Filter type: {type(query_filter)}")
 
        results = qdrant_client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            query_filter=query_filter if isinstance(query_filter, models.Filter) else None,
            limit=limit,
            with_payload=True,
            with_vectors=False
        )
 
        # Filter only high-confidence scores
        filtered = [r for r in results if r.score is not None and r.score >= min_score]
 
        if not filtered:
            print("⚠️ No high-score results, returning all results")
            return results
 
        return filtered
 
    except Exception as e:
        print(f"❌ Search failed inside Qdrant: {e}")
        raise RuntimeError(f"Qdrant search error: {e}")
 
 
# --- Get All Points ---
def get_all_points():
    initialize_qdrant_collection()
    try:
        records, _ = qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            with_payload=True,
            with_vectors=False
        )
        return records
    except Exception as e:
        print(f"❌ Failed to scroll collection: {e}")
        return []
 
 
# --- Run init ---
try:
    initialize_qdrant_collection()
    print("🚀 Qdrant Initialized: Collection + Index ready.")
except Exception as e:
    print(f"❌ Qdrant initialization failed: {e}")
 
 