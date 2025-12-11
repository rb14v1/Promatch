from django.urls import path
from .views import ResumeUploadView, ResumeSearchView, ResumeListView
from . import views

urlpatterns = [
    # ✅ Upload endpoint
    path('upload/', ResumeUploadView.as_view(), name='resume-upload'),

    # ✅ Search endpoints
    path('search/', ResumeSearchView.as_view(), name='resume-search'),
    path('retrieve/', ResumeSearchView.as_view(), name='resume-retrieve'),  # alias for frontend

    # ✅ List all resumes
    path('list/', ResumeListView.as_view(), name='resume-list'),

    # ✅ Proxy to safely fetch PDFs from S3
    path('proxy_resume/', views.proxy_resume, name='proxy_resume'),
    path("validate_word/", views.validate_word, name="validate_word"),

]
