import fitz  # PyMuPDF
from docx import Document
import re
from typing import Dict

def extract_file_content(file_obj) -> str:
    """
    Extracts raw text content from a PDF or DOCX file object.
    """
    file_type = file_obj.name.split('.')[-1].lower()
    full_text = ''
    
    # Reset file pointer to the beginning for processing
    file_obj.seek(0)
    
    if file_type == 'pdf':
        doc = fitz.open(stream=file_obj.read(), filetype="pdf")
        for page in doc:
            full_text += page.get_text()
    elif file_type == 'docx':
        doc = Document(file_obj)
        for para in doc.paragraphs:
            full_text += para.text + '\n'
    else:
        raise ValueError("Unsupported file type, only PDFs and DOCX are supported.")
    
    return full_text

import re
from typing import Dict
# Ensure you have 'from docx import Document' and 'import fitz' imported for extract_file_content

# Assuming extract_file_content is defined and works

def extract_fields(file_obj) -> Dict[str, str]:
    """
    Extracts metadata from the given file object, prioritizing the candidate's name
    by searching the lines around the email address.
    """
    text = extract_file_content(file_obj)
    
    # 1. Define Regex Patterns
    email_pattern = r"[\w\.-]+@[\w\.-]+"
    # Pattern for a name: 2-4 words starting with a capital letter
    name_pattern = r"([A-Z][a-z'\-]+\s+){1,3}([A-Z][a-z'\-]+\s*)" 
    
    candidate_name = ""
    email_match = re.search(email_pattern, text)
    
    if email_match:
        email = email_match.group(0)
        
        # 2. Heuristic Search: Look for the name on or above the email line
        lines = text.split('\n')
        
        # Get the index of the line containing the email
        email_line_index = next((i for i, line in enumerate(lines) if email in line), 0)
        
        # Search up to 5 lines above the email line
        search_range = lines[max(0, email_line_index - 5) : email_line_index + 1]
        
        # Define common, non-name words to exclude
        EXCLUDE_WORDS = r'classification|controlled|address|phone|email|linkedin|github|objective|education|skills|experience|certifications'
        
        for line in search_range:
            # Clean the line by removing the email, phone numbers, and common junk words
            cleaned_line = re.sub(EXCLUDE_WORDS, '', line, flags=re.IGNORECASE)
            cleaned_line = re.sub(r'[\d\-\+\(\)\|\/]', '', cleaned_line) # Remove numbers and symbols
            
            # Look for a pattern of 2 or more capitalized words
            name_candidates = re.findall(name_pattern, cleaned_line.strip())
            
            if name_candidates:
                # Join the captured groups to form the full name string
                full_name_list = ["".join(t) for t in name_candidates]
                
                # Pick the longest name found, which is usually the actual full name
                full_name = max(full_name_list, key=len).strip()
                
                if len(full_name.split()) >= 2 and len(full_name) < 40:
                    candidate_name = full_name
                    break
    
    # 3. Extract experience (for structured filtering)
    experience_years = 0
    experience_pattern = r'(?<!\d)(\d{1,2})\s*(?:years?|yrs?|YRS?)'
    match = re.search(experience_pattern, text, re.IGNORECASE)
    if match:
        # If a match is found, capture the digits and convert to an integer
        try:
            experience_years = int(match.group(1))
        except ValueError:
            experience_years = 0 # Should not happen, but safe to include

    return {
        "name": candidate_name if candidate_name else "Name Not Found",
        "email": email_match.group(0) if email_match else "",
        "experience_years": experience_years,
        "resume_text": text
    }