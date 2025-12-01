import requests

# --- Resume Upload ---
upload_url = 'http://98.94.9.126/api/upload/'

file_path = r'C:\Users\GowdaB\Downloads\Resume 2.pdf'

with open(file_path, 'rb') as f:
    files = {'resume_file': f}
    response = requests.post(upload_url, files=files)

print("Upload Status Code:", response.status_code)
try:
    print("Upload Response JSON:", response.json())
except requests.exceptions.JSONDecodeError:
    print("Upload Response Text:", response.text)

# --- Resume Search (POST) ---
search_url = 'http://98.94.9.126/api/search/'

search_payload = {'query': 'python developer'}

search_response = requests.post(search_url, json=search_payload)

print("\nSearch Status Code:", search_response.status_code)
try:
    print("Search Results:", search_response.json())
except requests.exceptions.JSONDecodeError:
    print("Search Response Text:", search_response.text)
