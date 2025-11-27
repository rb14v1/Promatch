import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import Footer from './components/Footer'
import UploadPage from './pages/UploadPage'
import RetrievePage from './pages/RetrievePage'
import ViewAllPage from './pages/ViewAllPage'

import SettingsPage from './pages/SettingsPage'
import Header from "./components/Header"; // ✅ Import confirmed
import UploadTest from  './pages/UploadTest.jsx';
// ✅ Import confirmed

export default function App() {
  return (
    <BrowserRouter>
      <div style={{display:'flex', flexDirection:'column', minHeight:'100vh'}}>
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/upload" element={<UploadPage/>} />
          <Route path="/retrieve" element={<RetrievePage/>} />
          <Route path="/view" element={<ViewAllPage/>} />
      
          <Route path="/settings" element={<SettingsPage/>} />
          <Route path="/upload-test" element={<UploadTest />} />

        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
