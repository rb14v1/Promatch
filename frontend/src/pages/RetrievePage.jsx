import React, { useState } from "react";
import "./RetrievePage.css";
import { englishWords } from "./englishWords";
import axios from "axios";
import Header from "../components/Header.jsx";
import ResumeViewer from "../components/ResumeViewer.jsx";

export default function RetrievePage() {
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Search keywords
  const [queryTags, setQueryTags] = useState([]);
  const [queryInput, setQueryInput] = useState("");
  const [queryError, setQueryError] = useState("");

  // Filters
  const [experienceFilter, setExperienceFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Suggestions
  const suggestions = ["python", "java", "cloud", "react", "ai", "sql"];

  // selected resume modal
  const [selectedResume, setSelectedResume] = useState(null);

  // Remove duplicates
  function deduplicateResults(results) {
    const seen = new Set();
    return results.filter((r) => {
      const key = `${r.data?.candidate_name}-${r.data?.email}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ⭐ Keyword Expander — FIXED
  const fetchExpandedKeywords = async (keyword) => {
  try {
    const res = await axios.post(
      "http://98.94.9.126/api/expand_keywords/",
      { query: keyword },
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (res.data?.keywords?.length > 0) {
      setQueryTags((prev) => [...new Set([...prev, ...res.data.keywords])]);
      return true;
    }

    return false;
  } catch (err) {
    console.error("Keyword expansion failed:", err);
    return false;
  }
};

  // Word validation (Gemini)
  const validateWithGemini = async (keyword) => {
    try {
      const res = await axios.post(
        "http://98.94.9.126/api/validate_word/",
        { query: keyword }
      );
      return res.data?.valid === true;
    } catch (err) {
      console.error("Gemini validation failed:", err);
      return false;
    }
  };

  // ⭐ SEARCH FUNCTION — FIXED
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

      const res = await axios.get(
        "http://98.94.9.126/api/retrieve/",
        {
          params: {
            query: combinedQuery,
            experience: experienceFilter,
            department: departmentFilter
          },
          headers: { "Accept": "application/json" }
        }
      );

      let cleanResults = res.data?.results || [];

      // Apply frontend filters
      if (experienceFilter) {
        cleanResults = cleanResults.filter((r) =>
          parseInt(r.data?.experience_years, 10) === parseInt(experienceFilter, 10)
        );
      }

      if (departmentFilter) {
        cleanResults = cleanResults.filter((r) =>
          (r.data?.department || "").toLowerCase() === departmentFilter.toLowerCase()
        );
      }

      cleanResults.sort((a, b) => (b.score || 0) - (a.score || 0));
      cleanResults = deduplicateResults(cleanResults);

      setResults(cleanResults);
      setStatus(
        cleanResults.length > 0
          ? `✅ Found ${cleanResults.length} resumes`
          : "⚠️ No resumes found with the selected criteria."
      );
    } catch (err) {
      console.error(err);
      setError("Search failed: " + (err.response?.data?.error || err.message));
      setStatus("❌ Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Clear Filters
  const clearFilters = () => {
    setExperienceFilter("");
    setDepartmentFilter("");
    setQueryTags([]);
    setQueryInput("");
  };

  return (
    <div className="retrieve-page">
      <Header />

      {/* Back Button */}
      <button
        type="button"
        onClick={() => window.history.back()}
        style={{
          position: "absolute",
          top: "100px",
          left: "30px",
          backgroundColor: "#0b4f4f",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >◀ Back</button>

      <header className="retrieve-header">
        <h2>Retrieve Resumes</h2>
        <p className="sub">Search and filter uploaded resumes</p>
      </header>

      <div className="retrieve-container">
        {/* Search Bar */}
        <div className="search-area">
          <div className="search-wrapper">
            <div className="scroll-inner">

              {/* Show tags */}
              {queryTags.map((tag, i) => (
                <div key={i} className="tag-chip">
                  {tag}
                  <button
                    className="remove-tag"
                    onClick={() =>
                      setQueryTags((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Input */}
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

                    setQueryError("");

                    let shouldAdd = true;
                    if (!englishWords.has(keyword)) {
                      shouldAdd = await validateWithGemini(keyword);
                      if (!shouldAdd) {
                        setQueryError(`"${keyword}" is not a valid keyword.`);
                      }
                    }

                    if (shouldAdd && !queryTags.includes(keyword)) {
                      setQueryTags((prev) => [...prev, keyword]);
                      await fetchExpandedKeywords(keyword);
                    }

                    setQueryInput("");
                  }
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

        {/* Filters */}
        <div className="filters">
          <div>
            <label>Experience</label>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
            >
              <option value="">Any</option>
              {[...Array(15)].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">Any</option>
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
              </optgroup>
              <optgroup label="Finance">
                <option>Accounting</option>
                <option>Taxation</option>
                <option>Auditing</option>
                <option>Financial Analysis</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Search + Clear */}
        <div className="buttons-area">
          <button onClick={runSearch} disabled={loading}>Search</button>
          <button onClick={clearFilters}>Clear</button>
        </div>

        {/* Results */}
        <main className="results-area">
          {loading && <p className="loading">Searching resumes...</p>}
          {status && <p className="status">{status}</p>}
          {error && <p className="inline-error">{error}</p>}

          {results.length === 0 && !loading && queryTags.length > 0 && (
            <p className="no-results">No resumes found.</p>
          )}

          {results.length > 0 && (
            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Experience</th>
                    <th>Match</th>
                    <th>Keywords</th>
                    <th>Resume</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td>{r.data?.candidate_name}</td>
                      <td>{r.data?.email}</td>
                      <td>{r.data?.experience_years} years</td>
                      <td>{Math.round(r.score)}%</td>
                      <td>
                        {(r.matched_keywords || []).join(", ") || "None"}
                      </td>
                      <td>
                        <button
                          className="resume-link"
                          onClick={() =>
                            setSelectedResume({
                              url: `http://98.94.9.126/api/proxy_resume/?file_url=${encodeURIComponent(
                                r.data.s3_url
                              )}`,
                              keywords: [...(r.matched_keywords || []), ...queryTags],
                              experience: r.data.experience_years,
                              department: r.data.department,
                              resumeText: r.data.resume_text,
                              originalS3Url: r.data.s3_url,
                            })
                          }
                        >
                          📄 View Resume
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </main>
      </div>

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
