import boto3
from django.conf import settings
import uuid
from botocore.exceptions import ClientError

def upload_resume_to_s3(file_obj, content_type): # <--- FIX IS HERE: ADD content_type
    """
    Uploads a file object (from a Django request) to the S3 bucket.
    Returns the public URL of the uploaded file.
    """
    # 1. Get credentials from Django settings
    s3 = boto3.client(
        's3', 
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION_NAME
    )
    
    # 2. Determine file name and content type
    file_extension = file_obj.name.split('.')[-1]
    object_name = f'resumes/{uuid.uuid4()}.{file_extension}'
    
    # Reset the file pointer to the beginning before uploading
    file_obj.seek(0)
    
    try:
        # 3. Use upload_fileobj for in-memory files
        s3.upload_fileobj(
            Fileobj=file_obj, 
            Bucket=settings.AWS_STORAGE_BUCKET_NAME, 
            Key=object_name,
            ExtraArgs={
                # Set ACL to 'public-read' if needed (currently commented out)
                # NOTE: The content_type comes from the new function argument
                'ContentType': content_type 
            }
        )
        
        # 4. Construct the S3 URL
        s3_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_REGION_NAME}.amazonaws.com/{object_name}"
        return s3_url
    
    except ClientError as e:
        # Log the full error for debugging
        print(f"S3 Client Error: {e}")
        # Re-raise an exception that Django will catch
        raise Exception(f"S3 upload failed: {e.response['Error']['Code']}") from e