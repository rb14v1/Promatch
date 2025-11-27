import React, { useState } from "react";
import "./RetrievePage.css";
import { englishWords } from "./englishWords";
import axios from "axios";
import Header from "../components/Header.jsx";
import ResumeViewer from "../components/ResumeViewer.jsx"; // ✅ PDF/Text resume viewer
 
export default function RetrievePage() {
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
 
  // 🔹 Search input state
  const [queryTags, setQueryTags] = useState([]);
  const [queryInput, setQueryInput] = useState("");
  const [queryError, setQueryError] = useState("");
 
  // 🔹 Filters
  const [experienceFilter, setExperienceFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
 
  // 🔹 Suggestions
  const suggestions = ["python", "java", "cloud", "react", "ai", "sql"];
 
  // 🔹 For resume preview modal
  const [selectedResume, setSelectedResume] = useState(null);
 
  // 🔹 Deduplicate results
  function deduplicateResults(results) {
    const seen = new Set();
    return results.filter((r) => {
      const key = `${r.data?.candidate_name}-${r.data?.email}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
 
  // 🔹 Fetch Gemini expansions for new words
  const fetchExpandedKeywords = async (keyword) => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/expand_keywords/", {
        query: keyword,
      });
      if (res.data?.keywords?.length > 0) {
        setQueryTags((prev) => [...new Set([...prev, ...res.data.keywords])]);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Keyword expansion failed:", err.message);
      return false;
    }
  };
 
  // 🔹 Validate word using Gemini
  const validateWithGemini = async (keyword) => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/validate_word/", {
        query: keyword,
      });
      return res.data?.valid === true;
    } catch (err) {
      console.error("Gemini validation failed:", err.message);
      return false;
    }
  };
 
  // 🔹 Run search
  const runSearch = async () => {
    if (queryTags.length === 0 && !experienceFilter && !departmentFilter) {
      setError("Please enter at least one keyword or select filters.");
      return;
    }
 
    setLoading(true);
    setStatus("Searching...");
    setError("");
 
    try {
      const combinedQuery = queryTags.join(" ");
      const res = await axios.post(
        "http://127.0.0.1:8000/retrieve/",
        {
          query: combinedQuery,
          filters: {
            experience: experienceFilter,
            department: departmentFilter,
          },
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
 
      let cleanResults = res.data?.results || [];
 
      if (experienceFilter) {
        cleanResults = cleanResults.filter((r) => {
          const exp = parseInt(r.data?.experience_years, 10);
          return exp === parseInt(experienceFilter, 10);
        });
      }
 
      if (departmentFilter) {
        cleanResults = cleanResults.filter((r) => {
          const dept = (r.data?.department || "").toLowerCase();
          return dept === departmentFilter.toLowerCase();
        });
      }
 
      cleanResults.sort((a, b) => (b.score || 0) - (a.score || 0));
      cleanResults = deduplicateResults(cleanResults);
 
      setResults(cleanResults);
      setStatus(
        cleanResults.length > 0
          ? `✅ Found ${cleanResults.length} resumes matching filters`
          : "⚠️ No resumes found with the selected filters."
      );
    } catch (err) {
      setError("Search failed: " + (err.response?.data?.error || err.message));
      setStatus("❌ Search failed");
    } finally {
      setLoading(false);
    }
  };
 
  // 🔹 Clear filters
  const clearFilters = () => {
    setExperienceFilter("");
    setDepartmentFilter("");
    setQueryTags([]);
    setQueryInput("");
  };
 
  return (
    <div className="retrieve-page">
      {/* ✅ Global Navigation Header */}
      <Header />
 
      {/* 🔙 Back Button */}
      <button
        type="button"
        onClick={() => window.history.back()}
        style={{
          position: "absolute",
          top: "100px",
          left: "30px",
          backgroundColor: "#0b4f4f",
          color: "#ffffff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          transition: "background-color 0.3s ease, transform 0.2s ease",
        }}
      >
        <span style={{ fontSize: "18px" }}>◀</span>Back
      </button>
 
      {/* ✅ Page-specific header */}
      <header className="retrieve-header">
        <h2>Retrieve Resumes</h2>
        <p className="sub">Search and filter uploaded resumes</p>
      </header>
 
      <div className="retrieve-container">
        {/* 🔹 Search bar */}
        <div
          className="search-area"
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div
            className="search-wrapper"
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ddddddff",
              borderRadius: "30px",
              width: "500px",
              maxWidth: "90%",
              backgroundColor: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              className="scroll-inner"
              style={{
                display: "flex",
                alignItems: "center",
                overflowX: "auto",
                whiteSpace: "nowrap",
                padding: "8px 12px",
                width: "100%",
              }}
            >
              {queryTags.map((tag, i) => (
                <div
                  key={`${tag}-${i}`}
                  style={{
                    backgroundColor: "#beffe9ff",
                    color: "#000000ff",
                    padding: "6px 10px",
                    borderRadius: "15px",
                    marginRight: "8px",
                    fontSize: "13px",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {tag}
                  <button
                    style={{
                      marginLeft: "6px",
                      background: "none",
                      border: "none",
                      color: "#0077cc",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "16px",
                      lineHeight: 1,
                      padding: 0,
                    }}
                    onClick={() =>
                      setQueryTags((prev) =>
                        prev.filter((_, index) => index !== i)
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
 
              <input
                list="retrieve-suggestions"
                className="search-input"
                placeholder="🔍 Type keywords and press Enter..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && queryInput.trim()) {
                    e.preventDefault();
                    const keyword = queryInput.trim().toLowerCase();
 
                    let shouldAdd = true;
                    setQueryError("");
 
                    if (!englishWords.has(keyword)) {
                      const isValid = await validateWithGemini(keyword);
                      shouldAdd = isValid;
                      if (!isValid) {
                        setQueryError(
                          `"${keyword}" is not a valid or recognized keyword.`
                        );
                      }
                    }
 
                    if (shouldAdd) {
                      if (!queryTags.includes(keyword)) {
                        setQueryTags((prev) => [...prev, keyword]);
                        await fetchExpandedKeywords(keyword);
                      }
                      setQueryInput("");
                    }
                  }
                }}
                style={{
                  flex: "1",
                  border: "none",
                  outline: "none",
                  fontSize: "15px",
                  padding: "0 5px",
                  background: "transparent",
                  color: "#000",
                }}
              />
            </div>
          </div>
        </div>
 
        {queryError && <div className="inline-error">{queryError}</div>}
 
        <datalist id="retrieve-suggestions">
          {suggestions.map((s, i) => (
            <option key={i} value={s} />
          ))}
        </datalist>
 
        {/* 🔹 Filters */}
        <div
          className="filters"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "20px",
            marginBottom: "15px",
            flexWrap: "wrap",
          }}
        >
          {/* Experience */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "5px", fontWeight: "bold", color: "white" }}>
              Experience (Years)
            </label>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "2px solid #000000ff",
                fontSize: "14px",
                backgroundColor: "#fffefeff",
                color: "black",
              }}
            >
              <option value="">Any</option>
              {[...Array(15)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
 
          {/* Department */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "5px", fontWeight: "bold", color: "white" }}>
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "2px solid #000000ff",
                fontSize: "14px",
                backgroundColor: "#ffffffff",
                color: "black",
              }}
            >
              <option value="">Any</option>
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
        </div>
 
        {/* ✅ Search button BELOW filters */}
        <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
  }}
>
  <button
    type="button"
    onClick={runSearch}
    disabled={loading}
    style={{
      backgroundColor: "#000",
      color: "#fff",
      border: "none",
      borderRadius: "15px",
      padding: "10px 25px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
      boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
      transition: "0.3s ease",
      minWidth: "120px",
    }}
    onMouseOver={(e) => (e.target.style.backgroundColor = "#222")}
    onMouseOut={(e) => (e.target.style.backgroundColor = "#000")}
  >
    Search
  </button>

  <button
    type="button"
    onClick={clearFilters}
    style={{
      backgroundColor: "#000",
      color: "#fff",
      border: "none",
      borderRadius: "15px",
      padding: "10px 25px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
      boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
      transition: "0.3s ease",
      minWidth: "120px",
    }}
    onMouseOver={(e) => (e.target.style.backgroundColor = "#222")}
    onMouseOut={(e) => (e.target.style.backgroundColor = "#000")}
  >
    Clear
  </button>
</div>

 
        {/* 🔹 Status + Results */}
        <main className="results-area">
          {loading && <p className="loading">Searching resumes...</p>}
          {status && <p className="status">{status}</p>}
          {error && <p className="inline-error">{error}</p>}
 
          {results.length === 0 && !loading && queryTags.length > 0 && (
            <p className="no-results">No matching resumes found.</p>
          )}
 
          {/* ✅ Results Table */}
          {results.length > 0 && (
            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Experience</th>
                    <th>Match Score</th>
                    <th>Matched Keywords</th>
                    <th>Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={`${r.id || i}`}>
                      <td>{r.data?.candidate_name || "Unnamed Candidate"}</td>
                      <td>{r.data?.email || "Not provided"}</td>
                      <td>
                        {r.data?.experience_years
                          ? `${r.data.experience_years} years`
                          : "—"}
                      </td>
                      <td>{r.score ? `${Math.round(r.score)}%` : "—"}</td>
                      <td>
                        {r.matched_keywords?.length > 0
                          ? r.matched_keywords.join(", ")
                          : "None matched"}
                      </td>
                      <td>
                        {r.data?.resume_text ? (
                          <button
                            className="resume-link"
                            onClick={() =>
                              setSelectedResume({
                                url: `http://127.0.0.1:8000/proxy_resume/?file_url=${encodeURIComponent(
                                  r.data.s3_url
                                )}`,
                                keywords: [
                                  ...(r.matched_keywords || []),
                                  ...queryTags,
                                ],
                                experience: r.data.experience_years,
                                department: r.data.department,
                                resumeText: r.data.resume_text || "",
                                originalS3Url: r.data.s3_url,
                              })
                            }
                          >
                            📄 View Resume
                          </button>
                        ) : (
                          <span>No resume text available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
 
      {/* 🔹 Resume Modal */}
      {selectedResume && (
        <ResumeViewer
          fileUrl={selectedResume.url}
          keywords={selectedResume.keywords}
          experience={selectedResume.experience}
          department={selectedResume.department}
          resumeText={selectedResume.resumeText}
          originalS3Url={selectedResume.originalS3Url}
          onClose={() => setSelectedResume(null)}
        />
      )}
    </div>
  );
}
 
 