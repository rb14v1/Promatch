import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UploadPage.css";
import Header from "../components/Header.jsx";

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [invalidFiles, setInvalidFiles] = useState([]);
  const [sizeErrors, setSizeErrors] = useState([]);
  const [uploadResults, setUploadResults] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [department, setDepartment] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const MAX_SIZE_MB = 5;

  useEffect(() => {
    if (invalidFiles.length > 0) {
      const timer = setTimeout(() => setInvalidFiles([]), 8000);
      return () => clearTimeout(timer);
    }
  }, [invalidFiles]);

  useEffect(() => {
    if (sizeErrors.length > 0) {
      const timer = setTimeout(() => setSizeErrors([]), 8000);
      return () => clearTimeout(timer);
    }
  }, [sizeErrors]);

  const isValidFile = (file) => /\.(docx|pdf)$/i.test(file.name);
  const isValidSize = (file) => file.size <= MAX_SIZE_MB * 1024 * 1024;

  const convertDocxToPdf = async (file) => {
    try {
      const buf = await file.arrayBuffer();
      const blob = new Blob([buf], { type: "application/pdf" });
      return new File([blob], file.name.replace(/\.[^.]+$/, ".pdf"), {
        type: "application/pdf",
      });
    } catch (e) {
      console.error("Conversion failed", e);
      return null;
    }
  };

  const uploadToBackend = async (file) => {
    console.log(`📤 Uploading "${file.name}"`);

    const formData = new FormData();
    formData.append("resume_file", file);
    formData.append("department", department);
    formData.append("experience_years", experience);

    try {
     const res = await axios.post("http://98.94.9.126/api/upload/", formData, {


        headers: { Accept: "application/json" },
      });
      const metadata = res.data?.data;
      setUploadResults((prev) => [...prev, metadata]);
      setUploadError("");
    } catch (err) {
      console.error("❌ Upload failed:", err.message);
      setUploadError(`Upload failed for ${file.name}`);
    }
  };

  const handleFiles = async (selectedFilesArray) => {
    const validFiles = [];

    for (const f of selectedFilesArray) {
      if (!isValidFile(f)) {
        setInvalidFiles((p) => [...p, `${f.name} (unsupported)`]);
        continue;
      }
      if (!isValidSize(f)) {
        setSizeErrors((p) => [...p, `${f.name} too large`]);
        continue;
      }

      let finalFile = f;
      if (/\.docx$/i.test(f.name)) {
        const pdf = await convertDocxToPdf(f);
        if (!pdf) continue;
        finalFile = pdf;
      }

      validFiles.push(finalFile);
    }

    setSelectedFiles(validFiles);
  };

  const handleFileChange = (e) => {
    const selectedFilesArray = Array.from(e.target.files || []);
    handleFiles(selectedFilesArray);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files || []));
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const goBackHome = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!department || !experience || selectedFiles.length === 0) {
      alert("Please complete all steps before submission!");
      return;
    }

    for (const file of selectedFiles) {
      const item = {
        id: `${Date.now()}-${file.name}`,
        file,
        uploadedAt: new Date().toISOString(),
      };
      setFiles((p) => [...p, item]);
      await uploadToBackend(file);
    }

    setSuccessMessage("✅ Upload Successful!");
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  return (
    <div className="upload-page">
      <Header />

      <div style={{ marginTop: "80px" }}>
        <div className="upload-nav">
          <button className="back-btn" onClick={goBackHome}>
            <span className="back-icon">◀</span> Back
          </button>
        </div>

        <header className="upload-header">Resume Upload</header>

        {successMessage && (
          <div
            style={{
              background: "#1DAA61",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
              margin: "10px auto",
              width: "fit-content",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            }}
          >
            {successMessage}
          </div>
        )}

        <main
          className="upload-main"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <section
            className="upload-left"
            style={{
              border: "2px solid rgba(255,255,255,0.2)",
              borderRadius: "12px",
              padding: "30px",
              backgroundColor: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(6px)",
              width: "400px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
            }}
          >
            {/* Step 1 */}
            <div className="form-group" style={{ width: "100%" }}>
              <label
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    background: "#0077cc",
                    padding: "3px 8px",
                    borderRadius: "50%",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  1
                </span>
                Select Department
              </label>

              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid #ccc",
                  fontSize: "15px",
                }}
              >
                <option value="">-- Choose Department --</option>

                <optgroup label="Human Resources">
                  <option>Junior HR</option>
                  <option>Senior HR</option>
                  <option>HR Operations</option>
                  <option>Talent Acquisition</option>
                  <option>Learning & Development</option>
                </optgroup>

                <optgroup label="Engineering / IT">
                  <option>Software Development</option>
                  <option>DevOps</option>
                  <option>Data Science</option>
                  <option>Machine Learning</option>
                  <option>Quality Assurance</option>
                  <option>Cybersecurity</option>
                </optgroup>

                <optgroup label="Sales & Marketing">
                  <option>Pre-Sales</option>
                  <option>Post-Sales</option>
                  <option>Business Development</option>
                  <option>Digital Marketing</option>
                  <option>Product Marketing</option>
                </optgroup>

                <optgroup label="Finance & Accounting">
                  <option>Accounting</option>
                  <option>Auditing</option>
                  <option>Taxation</option>
                  <option>Financial Analysis</option>
                </optgroup>
              </select>
            </div>

            {/* Step 2 */}
            <div
              className="form-group"
              style={{
                marginTop: "20px",
                opacity: department ? 1 : 0.4,
                pointerEvents: department ? "auto" : "none",
                width: "100%",
              }}
            >
              <label
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    background: "#0077cc",
                    padding: "3px 8px",
                    borderRadius: "50%",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  2
                </span>
                Years of Experience
              </label>

              <input
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid #ccc",
                  fontSize: "15px",
                }}
              />
            </div>

            {/* Step 3 */}
            <div
              className={`upload-dropzone ${isDragOver ? "dragover" : ""}`}
              onDragOver={onDragOver}
              onDragEnter={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{
                marginTop: "25px",
                opacity: experience ? 1 : 0.4,
                pointerEvents: experience ? "auto" : "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <label
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    background: "#0077cc",
                    padding: "3px 8px",
                    borderRadius: "50%",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  3
                </span>
                Upload Resume
              </label>

              <p className="upload-instruction">Drag Files to Upload</p>

              <button className="browse-btn" onClick={openFileDialog} type="button">
                BROWSE FILES
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
                accept=".pdf,.docx"
              />

              {selectedFiles.length > 0 && (
                <div
                  style={{
                    marginTop: "15px",
                    background: "rgba(255,255,255,0.08)",
                    padding: "10px",
                    borderRadius: "8px",
                    width: "100%",
                  }}
                >
                  <strong style={{ color: "#fff" }}>Selected Files:</strong>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      marginTop: "8px",
                    }}
                  >
                    {selectedFiles.map((file, i) => (
                      <li
                        key={i}
                        style={{
                          color: "#e6f3ff",
                          fontSize: "14px",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>✅ {file.name}</span>
                        <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Step 4 */}
            <button
              type="button"
              onClick={handleSubmit}
              className="browse-btn"
              style={{
                width: "100%",
                marginTop: "25px",
                opacity: department && experience && selectedFiles.length > 0 ? 1 : 0.6,
                cursor: department && experience && selectedFiles.length > 0 ? "pointer" : "not-allowed",
              }}
              disabled={!department || !experience || selectedFiles.length === 0}
            >
              SUBMIT DETAILS & UPLOAD
            </button>
          </section>

          <section className="upload-right">
            {uploadError && (
              <div className="invalid-warning">
                <strong>Upload Error:</strong> {uploadError}
              </div>
            )}

            {uploadResults.length > 0 && (
              <div className="upload-results">
                <h3>Uploaded Resume Metadata</h3>
                {uploadResults.map((m, i) => (
                  <div key={i} className="upload-result-card">
                    <p>
                      <strong>Name:</strong> {m.candidate_name || "Unnamed"}
                    </p>
                    <p>
                      <strong>Email:</strong> {m.email || "Not provided"}
                    </p>
                    <p>
                      <strong>Experience:</strong> {m.experience_years ?? "N/A"} years
                    </p>
                    <p>
                      <strong>Department:</strong> {m.department || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
