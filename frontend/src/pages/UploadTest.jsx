import React, { useState } from 'react';
import axios from 'axios';

export default function UploadTest() {
  const [uploadStatus, setUploadStatus] = useState('');
  const [metadata, setMetadata] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("📂 Selected file:", file.name, file.type, file.size);

    const formData = new FormData();
    formData.append('resume_file', file);

    try {
      const res = await axios.post('http://98.94.9.126/api/upload/', formData, {
  headers: {
    "Accept": "application/json",
    "Content-Type": "multipart/form-data"
  },
});


      console.log("✅ Upload successful:", res.data);
      setUploadStatus('Upload successful');
      setMetadata(res.data?.data);
    } catch (err) {
      console.error("❌ Upload failed:", err.response?.data || err.message);
      setUploadStatus('Upload failed');
    }
  };

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h2 style={{ color: 'white' }}>Minimal Resume Upload Test</h2>
      <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      <p style={{ color: 'white' }}>Status: {uploadStatus}</p>

      {metadata && (
        <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem', color: 'white' }}>
          <h3 style={{ color: 'white' }}>Metadata</h3>
          <p><strong>Name:</strong> {metadata.candidate_name}</p>
          <p><strong>Email:</strong> {metadata.email}</p>
          <p><strong>Experience:</strong> {metadata.experience_years} years</p>
          <p>
            <strong>S3 URL:</strong>{' '}
            <a href={metadata.s3_url} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
              {metadata.s3_url}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
