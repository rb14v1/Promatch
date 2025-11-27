// ResumeViewer.jsx
 
import React from "react";
 
export default function ResumeViewer({
  fileUrl,
  keywords = [],
  experience,
  department,
  resumeText,
  originalS3Url, // ✅ 1. Accept the new prop
  onClose,
}) {
  // 🔹 Highlight function
  const highlightKeywords = (text, keywords) => {
    if (!text || !keywords || keywords.length === 0) return text;
 
    let escapedKeywords = keywords.map((kw) =>
      kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    let regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");
 
    return text.replace(
      regex,
      (match) =>
        `<mark style="background: yellow; color: black; font-weight: bold;">${match}</mark>`
    );
  };
 
  const highlightedText = highlightKeywords(resumeText || "", keywords);
 
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          width: "80%",
          maxHeight: "85%",
          overflowY: "auto",
          padding: "30px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        }}
      >
        {/* 🔹 Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center", // ✨ Vertically align items
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              color: "#222",
            }}
          >
            Resume Preview
          </h2>
 
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {/* ✅ 2. THIS IS THE NEW BUTTON 👇 */}
            {originalS3Url && (
              <a
                href={originalS3Url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#008080", // A nice blue color
                  border: "none",
                  color: "#fff",
                  fontWeight: "bold",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  textDecoration: "none", // Remove underline from link
                  fontSize: "14px",
                }}
              >
                📄 View Original
              </a>
            )}
 
            <button
              onClick={onClose}
              style={{
                background: "#ff4d4f",
                border: "none",
                color: "#fff",
                fontWeight: "bold",
                padding: "8px 16px", // Matched padding
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>
 
        {/* 🔹 Candidate Metadata */}
        <div style={{ marginBottom: "20px", color: "#222" }}>
          <p>
            <strong>Department:</strong> {department ? department : "N/A"}
          </p>
          <p>
            <strong>Experience:</strong>{" "}
            {experience ? `${experience} years` : "N/A"}
          </p>
        </div>
 
        {/* 🔹 Resume Text (Highlighted) */}
        <div
          style={{
            color: "#222",
            lineHeight: "1.6",
            fontSize: "15px",
            fontFamily: "Arial, sans-serif",
            whiteSpace: "pre-wrap",
          }}
          dangerouslySetInnerHTML={{ __html: highlightedText }}
        />
      </div>
    </div>
  );
}
 