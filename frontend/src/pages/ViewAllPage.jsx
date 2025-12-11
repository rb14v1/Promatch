import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header.jsx"; // ✅ Added shared Header component

export default function ViewAllPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/list/");
        console.log("API Response:", res.data);

        if (Array.isArray(res.data)) {
          setResumes(res.data);
        } else if (res.data.results && Array.isArray(res.data.results)) {
          setResumes(res.data.results);
        } else {
          setError("Unexpected API response format.");
        }
      } catch (err) {
        setError(
          "Failed to fetch resumes: " +
            (err.response?.data?.error || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  // --- Styles ---
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "25px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.35)",
    borderRadius: "8px",
    overflow: "hidden",
  };

  const thStyle = {
    backgroundColor: "#f5eacb",
    color: "#070404ff",
    padding: "14px 18px",
    textAlign: "left",
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: "13px",
    letterSpacing: "0.5px",
  };

  const tdStyle = {
    padding: "14px 18px",
    borderBottom: "1px solid #e0e0e0",
    color: "#333",
  };

  const actionLinkStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#1DAA61",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    textDecoration: "none",
    fontWeight: "500",
    transition: "background-color 0.2s ease, transform 0.2s ease",
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        padding: "40px 2%",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(to bottom, #103c42, #1b998b)",
        color: "#EFEFEF",
      }}
    >
      {/* ✅ Shared Header */}
      <Header />

      {/* 🔙 Styled Back Button */}
      <button
        type="button"
        onClick={() => window.history.back()}
        aria-label="Back to home"
        style={{
          position: "absolute",
          top: "100px",
          left: "30px",
          backgroundColor: "#0b4f4f", // Dark teal
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
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "#298686ff";
          e.target.style.transform = "scale(1.05)";
          const icon = e.currentTarget.querySelector("span");
          if (icon) icon.style.color = "#000000";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "#0b4f4f";
          e.target.style.transform = "scale(1)";
          const icon = e.currentTarget.querySelector("span");
          if (icon) icon.style.color = "#ffffff";
 
        }}
      >
        <span style={{ fontSize: "18px" }}>◀</span>
        Back
      </button>

      <h2
        style={{
          fontSize: "32px",
          fontWeight: "700",
          marginBottom: "20px",
          marginTop: "140px", // ✅ Added spacing below header
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          color: "#FFFFFF",
        }}
      >
        📄 All Uploaded Resumes
      </h2>

      {loading && (
        <p style={{ textAlign: "center", color: "#FFFFFF" }}>
          ⏳ Loading resumes...
        </p>
      )}

      {error && (
        <p style={{ color: "#ff8a80", textAlign: "center" }}>{error}</p>
      )}

      {!loading && resumes.length === 0 && !error && (
        <p
          style={{
            textAlign: "center",
            fontStyle: "italic",
            color: "#FFFFFF",
          }}
        >
          No resumes uploaded yet.
        </p>
      )}

      {!loading && resumes.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Candidate Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Experience</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {resumes.map((resume, idx) => {
                const isEven = idx % 2 === 0;
                const rowBackground = isEven ? "#fff7eb" : "#fceecd";
                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: rowBackground,
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#f2e5cd";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = rowBackground;
                    }}
                  >
                    <td style={tdStyle}>
                      {resume.candidate_name || "Unnamed Candidate"}
                    </td>
                    <td style={tdStyle}>{resume.email || "Not Provided"}</td>
                    <td style={tdStyle}>
                      {resume.experience_years
                        ? `${resume.experience_years} years`
                        : "—"}
                    </td>
                    <td style={tdStyle}>{resume.department || "—"}</td>
                    <td style={tdStyle}>
                      {resume.s3_url && (
                        <a
                          href={`http://127.0.0.1:8000/proxy_resume/?file_url=${encodeURIComponent(
                            resume.s3_url
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={actionLinkStyle}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = "#18894d";
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "#1DAA61";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <span role="img" aria-label="view">
                            📄
                          </span>{" "}
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
