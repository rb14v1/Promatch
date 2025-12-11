from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, Filter
from django.conf import settings

import uuid

# Connect to Qdrant
client = QdrantClient(
    url=settings.QDRANT_CLUSTER_URL,
    api_key=settings.QDRANT_API_KEY
)

COLLECTION_NAME = "resume_collection"


# -----------------------------
# UPSERT POINT
# -----------------------------
def upsert_point(point_id, embedding, payload):
    point = PointStruct(
        id=point_id,
        vector=embedding,
        payload=payload
    )
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[point]
    )


# -----------------------------
# SEARCH COLLECTION
# -----------------------------
def search_collection(query_embedding, filter=None, limit=50):
    return client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding,
        query_filter=filter,
        limit=limit
    )


# -----------------------------
# GET ALL POINTS
# -----------------------------
def get_all_points(limit=1000):
    return client.scroll(
        collection_name=COLLECTION_NAME,
        limit=limit
    )[0]
