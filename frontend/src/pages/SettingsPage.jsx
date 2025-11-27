import React from "react";
import Header from "../components/Header.jsx";

export default function SettingsPage() {
  return (
    <div
      className="settings-page"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #004f4f 0%, #007f7f 100%)",
        color: "#fff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: "relative",
        overflowX: "hidden",
        paddingBottom: "50px",
      }}
    >
      {/* ✅ Global Navigation Header */}
      <Header />

      {/* 🔙 Back Button */}
      <button
        type="button"
        onClick={() => window.history.back()}
        aria-label="Back to home"
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
          zIndex: 1000,
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

      {/* ✅ Page Header */}
      <header
        style={{
          textAlign: "center",
          paddingTop: "140px",
          marginBottom: "30px",
        }}
      >
        <h2
          style={{
            fontSize: "30px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          System Architecture Status
        </h2>
        <p style={{ color: "#d7f9f9", fontSize: "16px" }}>
          Overview of current architecture and AI-enhanced configurations
        </p>
      </header>

      {/* ✅ Content Card */}
      <div
        className="settings-card"
        style={{
          maxWidth: "900px",
          backgroundColor: "#ffffff",
          color: "#1a1a1a",
          margin: "0 auto",
          borderRadius: "20px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
          padding: "40px 50px",
          lineHeight: "1.7",
          fontSize: "16px",
        }}
      >
        <p style={{ marginBottom: "20px" }}>
          This application utilizes a robust, modern architecture designed for
          high-speed semantic retrieval. All resume data is processed and
          managed across specialized services:
        </p>

        <ul style={{ listStyleType: "disc", paddingLeft: "30px" }}>
          <li style={{ marginBottom: "15px" }}>
            <strong>Core Search Intelligence:</strong> The entire resume corpus
            is indexed in the <strong>Qdrant Vector Database</strong>. All
            searches operate in a <strong>384-dimensional space</strong>,
            ensuring contextual relevance beyond simple keyword matching.
          </li>

          <li style={{ marginBottom: "15px" }}>
            <strong>Data Storage:</strong> All original file uploads (PDF/DOCX)
            are securely maintained in the dedicated AWS S3 bucket 
            .
          </li>

          <li style={{ marginBottom: "15px" }}>
            <strong>Relevance Settings:</strong> The default search relevance
            threshold is set to <strong>30% (score of 0.3)</strong>. Any resume
            matching below this score is automatically filtered out.
          </li>

          <li style={{ marginBottom: "15px" }}>
            <strong>Dynamic Highlighting:</strong> Contextual synonym matching
            is <strong>enabled via a secure LLM connection</strong>, ensuring
            technical terms are correctly highlighted even when the user
            searches for generic concepts.
          </li>
        </ul>

        {/* ✅ Status footer */}
        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #ccc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "14px", color: "#444" }}>
            Last updated: <strong>October 7, 2025</strong>
          </span>
          <span
            style={{
              backgroundColor: "#00796b",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "20px",
              fontWeight: "bold",
              fontSize: "14px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            ✅ All Systems Operational
          </span>
        </div>
      </div>
    </div>
  );
}
