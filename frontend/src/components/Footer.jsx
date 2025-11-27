import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-row">
        &copy; {new Date().getFullYear()} Version 1. All rights reserved.
      </div>
    </footer>
  );
}
