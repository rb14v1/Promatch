import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

import ViewIcon from '../assets/icons/view.svg';
import SettingsIcon from '../assets/icons/settings.svg';
import UploadPageImage from '../assets/icons/uploadpage.png';
import RetrievePageImage from '../assets/icons/retrievepage.png';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import HomeTour from './HomeTour';
import './Footer.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage-root">

      <HomeTour />
      <Header />

      {/* ⬇⬇⬇ FIXED: Removed marginTop */}
      <main className="homepage-main two-column">

        <section className="left-column">
          <p className="description-text" style={{ marginBottom: '20px' }}>
            The Resume Checker Application is a web-based tool designed to help
            users upload, analyze, and manage resumes efficiently. The
            application streamlines the resume review process for Managers and
            HRs by fetching instant filtered resumes based on keyword relevance.
          </p>

          <div className="action-section left-actions">
            <div className="action-buttons main-buttons">

              <button
                id="upload-btn"
                className="action-btn"
                onClick={() => navigate('/upload')}
                aria-label="Upload File"
                style={{
                  width: 200,
                  height: 160,
                  backgroundColor: '#000',
                  color: '#fff',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = 'scale(1.05)')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
              >
                <img
                  src={UploadPageImage}
                  alt="Upload"
                  style={{
                    width: '90%',
                    height: '100px',
                    objectFit: 'contain',
                    marginBottom: '10px',
                  }}
                />
              </button>

              <button
                id="retrieve-btn"
                className="action-btn"
                onClick={() => navigate('/retrieve')}
                aria-label="Retrieve File"
                style={{
                  width: 200,
                  height: 160,
                  backgroundColor: '#000',
                  color: '#fff',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = 'scale(1.05)')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
              >
                <img
                  src={RetrievePageImage}
                  alt="Retrieve"
                  style={{
                    width: '90%',
                    height: '100px',
                    objectFit: 'contain',
                    marginBottom: '10px',
                  }}
                />
              </button>

            </div>
          </div>

          <section className="nav-cards" style={{ marginTop: '30px' }}>

            <div
              id="view-card"
              className="card"
              onClick={() => navigate('/view')}
              style={{
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = 'scale(1.05)')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = 'scale(1)')
              }
            >
              <img
                src={ViewIcon}
                alt="view icon"
                className="card-icon"
                style={{ filter: 'invert(1)' }}
              />
              <div className="card-title" style={{ color: '#fff' }}>
                View All Resumes
              </div>
            </div>

            <div
              id="settings-card"
              className="card"
              onClick={() => navigate('/settings')}
              style={{
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = 'scale(1.05)')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = 'scale(1)')
              }
            >
              <img
                src={SettingsIcon}
                alt="settings icon"
                className="card-icon"
                style={{ filter: 'invert(1)' }}
              />
              <div className="card-title" style={{ color: '#fff' }}>
                Settings
              </div>
            </div>

          </section>

        </section>

      </main>

      <div className="resume-logo" aria-hidden="true">
        RESUME
      </div>

    </div>
  );
}
