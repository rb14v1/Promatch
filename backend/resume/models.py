from django.db import models

# Create your models here.
class Resume(models.Model):
    name=models.CharField(max_length=255)
    email=models.EmailField(unique=True)
    contact=models.CharField(max_length=10)
    s3_link=models.URLField()