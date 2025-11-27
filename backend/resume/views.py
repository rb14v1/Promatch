import uuid
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from qdrant_client.http.models import Filter, FieldCondition, Range, MatchValue
 
# Service imports
from .services.s3_service import upload_resume_to_s3
from .services.extract_data import extract_fields
from .services.embedding_service import get_text_embedding
from .services.qdrant_service import upsert_point, search_collection, get_all_points
 
# --- Gemini Import for Dynamic Keywords ---
import google.generativeai as genai
from django.conf import settings
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("models/gemini-2.5-pro")
 
import requests
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# @lru_cache(maxsize=10)
def get_dynamic_synonym_map(base_terms=None):
    """
    Dynamically generate a synonym map using Gemini for given categories.
    If no base_terms provided, default categories will be used.
    """
    if base_terms is None:
        base_terms = ["script", "language", "database", "cloud"]

    synonym_map = {}
    for term in base_terms:
        prompt = (
            f"List 10 related or synonymous technical keywords for '{term}' "
            f"(programming, frameworks, or IT-related). "
            "Return only a comma-separated list, no explanations."
        )
        try:
            response = model.generate_content(prompt)
            text = response.text.strip().lower()
            synonyms = [kw.strip() for kw in text.split(",") if kw.strip()]
            synonym_map[term] = synonyms
        except Exception as e:
            print(f"⚠️ Gemini failed to generate synonyms for '{term}': {e}")
            # fallback default
            synonym_map[term] = []

    return synonym_map

 
 
def get_related_keywords(query: str) -> list[str]:
    """Use Gemini to expand search query with related keywords."""
    prompt = f"Only return comma-separated keywords related to the word '{query}'. No explanation."
    response = model.generate_content(prompt)
    keywords_str = response.text.strip()
    return [kw.strip().lower() for kw in keywords_str.split(",") if kw.strip()]
 
 
# --- Resume Upload ---
class ResumeUploadView(APIView):
    def post(self, request, *args, **kwargs):
        resume_file = request.FILES.get('resume_file')
        if not resume_file:
            return Response({'error': 'No resume file provided'}, status=status.HTTP_400_BAD_REQUEST)
 
        file_content_type = resume_file.content_type
        file_content = resume_file.read()
 
        s3_buffer = io.BytesIO(file_content)
        s3_buffer.name = resume_file.name
 
        extract_buffer = io.BytesIO(file_content)
        extract_buffer.name = resume_file.name
 
        # 1. Upload to S3
        try:
            s3_url = upload_resume_to_s3(s3_buffer, file_content_type)
        except Exception as e:
            return Response({'error': f'S3 upload failed: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
        # 2. Extract text + metadata
        try:
            extracted_data = extract_fields(extract_buffer)
        except Exception as e:
            return Response({'error': f'Text extraction failed: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
        # ✅ Override extracted values with frontend-provided values
        department = request.POST.get("department") or extracted_data.get("department")
        experience_years = request.POST.get("experience_years") or extracted_data.get("experience_years")
 
        # 🔹 Ensure experience_years is integer
        try:
            experience_years = int(experience_years) if experience_years not in [None, "", "None"] else 0
        except Exception:
            experience_years = 0
 
        # 3. Embed
        embedding = get_text_embedding(extracted_data.get('resume_text', ''))
 
        # 4. Payload
        payload = {
            "s3_url": s3_url,
            "candidate_name": extracted_data.get("name"),
            "email": extracted_data.get("email"),
            "experience_years": experience_years,   # ✅ always int now
            "department": department or "General",
            "skills": extracted_data.get("skills", []),
            "year_joined": extracted_data.get("year_joined"),
            "resume_text": extracted_data.get("resume_text"),
        }
 
        # 5. Save to Qdrant
        point_id = str(uuid.uuid4())
        try:
            upsert_point(point_id, embedding, payload)
        except Exception as e:
            return Response({'error': f'Qdrant upsert failed: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
        return Response({
            'message': 'Upload and processing complete!',
            'data': payload,
            'qdrant_id': point_id
        }, status=status.HTTP_201_CREATED)
 
from qdrant_client.http import models
 
class ResumeSearchView(APIView):
    def post(self, request, *args, **kwargs):
        query = request.data.get('query', '')
        filters = request.data.get('filters', {})
 
        if not query:
            return Response({'error': 'A search query is required'}, status=status.HTTP_400_BAD_REQUEST)
 
        query_embedding = get_text_embedding(query)
 
        # -----------------------------
        # 1. Convert Python filters → Qdrant Filter
        # -----------------------------
        query_filter = None
        must_conditions = []
 
        exp_range = filters.get("experience", "")
        dept = filters.get("department", "")
 
        # Department filter
        if dept and dept not in ["", "Any"]:
            must_conditions.append(
                models.FieldCondition(
                    key="department",
                    match=models.MatchValue(value=dept)
                )
            )
 
        # Experience filter
        if exp_range and exp_range != "Any":
            if exp_range == "0-2":
                must_conditions.append(models.FieldCondition(
                    key="experience_years",
                    range=models.Range(gte=0, lte=2)
                ))
            elif exp_range == "3-5":
                must_conditions.append(models.FieldCondition(
                    key="experience_years",
                    range=models.Range(gte=3, lte=5)
                ))
            elif exp_range == "6-10":
                must_conditions.append(models.FieldCondition(
                    key="experience_years",
                    range=models.Range(gte=6, lte=10)
                ))
            elif exp_range == "10+":
                must_conditions.append(models.FieldCondition(
                    key="experience_years",
                    range=models.Range(gte=10)
                ))
 
        if must_conditions:
            query_filter = models.Filter(must=must_conditions)
 
        # -----------------------------
        # 2. Qdrant Search
        # -----------------------------
        try:
            all_results = search_collection(query_embedding, query_filter=query_filter, limit=1000)
        except Exception as e:
            return Response({'error': f'Qdrant primary search failed: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
        # -----------------------------
        # 3. Python-side filters
        # -----------------------------
        def match_exp(exp_value, exp_range):
            if not exp_range or exp_range == "Any":
                return True
            if exp_range == "0-2":
                return 0 <= exp_value <= 2
            elif exp_range == "3-5":
                return 3 <= exp_value <= 5
            elif exp_range == "6-10":
                return 6 <= exp_value <= 10
            elif exp_range == "10+":
                return exp_value >= 10
            return True
 
        filtered_resumes = []
        for match in all_results:
            try:
                exp_val = int(match.payload.get("experience_years", 0) or 0)
            except Exception:
                exp_val = 0
            dep_val = match.payload.get("department", "")
 
            if match_exp(exp_val, exp_range) and (dept in ["", "Any"] or dep_val == dept):
                filtered_resumes.append(match)
 
        # -----------------------------
        # 4. Keyword boosting
        # -----------------------------
        query_keywords = set(query.lower().split())
        words_to_highlight = set(query_keywords)
 
        try:
            related_keywords = get_related_keywords(query)
            words_to_highlight.update(related_keywords)
        except Exception as e:
            print(f"⚠️ Gemini expansion failed: {e}")
 
        results = []
        for match in filtered_resumes:
            resume_content = (match.payload.get('resume_text') or '').lower()
            matched_keywords = [kw for kw in words_to_highlight if kw in resume_content]
 
            base_score = match.score or 0
            keyword_boost = len(matched_keywords) * 5
 
            # ✅ Ensure experience_years is always numeric
            try:
                exp_years = int(match.payload.get("experience_years", 0) or 0)
            except Exception:
                exp_years = 0
 
            exp_boost = exp_years * 1.5
 
            final_score = min(100, base_score * 100 + keyword_boost + exp_boost)
 
            response_data = dict(match.payload)
            results.append({
                'id': match.id,
                'score': round(final_score, 2),
                'data': response_data,
                'matched_keywords': matched_keywords
            })
 
 
        results.sort(key=lambda r: r['score'], reverse=True)
 
        return Response({
            "results": results,
            "highlight_words": list(words_to_highlight)
        }, status=status.HTTP_200_OK)
 
 
# --- Resume List View ---
class ResumeListView(APIView):
    def get(self, request):
        try:
            qdrant_records = get_all_points()
            formatted_results = []
            for record in qdrant_records:
                payload = record.payload
                filtered_data = {
                    'candidate_name': payload.get('candidate_name'),
                    'email': payload.get('email'),
                    'experience_years': payload.get('experience_years'),
                    'department': payload.get('department'),
                    's3_url': payload.get('s3_url'),
                    'resume_text': payload.get('resume_text')  # ✅ keep for viewer
                }
                formatted_results.append(filtered_data)
 
            return Response({"results": formatted_results}, status=status.HTTP_200_OK)
 
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
 
# --- Proxy Resume View ---
def proxy_resume(request):
    file_url = request.GET.get("file_url")
    if not file_url:
        return JsonResponse({"error": "Missing file_url parameter"}, status=400)
 
    try:
        response = requests.get(file_url, stream=True, timeout=10)
        response.raise_for_status()
        pdf_data = response.content
        return HttpResponse(pdf_data, content_type="application/pdf")
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": f"Failed to fetch PDF: {str(e)}"}, status=500)
 
 
# --- Word Validation View (Gemini-Only) ---
@csrf_exempt
def validate_word(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        body = json.loads(request.body.decode("utf-8"))
        word = body.get("query", "").strip().lower()

        if not word:
            return JsonResponse({"valid": False})

        # 🔹 Gemini-based validation only
        prompt = f"""
        Determine whether "{word}" represents a valid technology term, programming language, IT skill, framework, 
        or professional job-related keyword. 
        Respond strictly with "yes" if it is relevant in a professional or technical context, otherwise "no".
        """

        response = model.generate_content(prompt)
        text = response.text.strip().lower()

        # 🔹 Parse Gemini’s response
        is_valid = "yes" in text and "no" not in text
        return JsonResponse({"valid": is_valid})

    except Exception as e:
        return JsonResponse({"error": str(e), "valid": False}, status=500)
