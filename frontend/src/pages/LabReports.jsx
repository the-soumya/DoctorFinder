import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileUp, 
  Sparkles,
  Download,
  Activity,
  Layers
} from 'lucide-react';

export default function LabReports() {
  const [reports, setReports] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [latestSummary, setLatestSummary] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/lab-reports/my');
      setReports(res.data);
    } catch (err) {
      console.error('Failed to load lab reports', err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF or text lab report file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/lab-reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLatestSummary(res.data);
      setSelectedFile(null);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to extract lab report metrics.');
    } finally {
      setUploading(false);
    }
  };

  // Helper to load a demo sample metabolic text file for instant evaluation
  const handleLoadSampleReport = async () => {
    const sampleText = `CENTRAL CLINICAL PATHOLOGY LAB
PATIENT: Rohan Verma | AGE: 34 | GENDER: Male
TEST PANEL: Comprehensive Metabolic & Lipid Screen

CLINICAL PARAMETERS:
Fasting Blood Sugar: 126 mg/dL (Reference: 70 - 99 mg/dL)
HbA1c: 6.4 % (Reference: 4.0 - 5.6 %)
Total Cholesterol: 228 mg/dL (Reference: 125 - 200 mg/dL)
Blood Pressure Systolic: 138 mmHg (Reference: 90 - 120 mmHg)
Hemoglobin: 14.8 g/dL (Reference: 13.0 - 17.0 g/dL)
Serum Creatinine: 0.95 mg/dL (Reference: 0.6 - 1.2 mg/dL)
WBC Count: 6800 cells/mcL (Reference: 4000 - 11000 cells/mcL)

NOTES: Fasting 10 hours observed prior to phlebotomy.`;

    const blob = new Blob([sampleText], { type: 'text/plain' });
    const file = new File([blob], 'Sample_Metabolic_Profile.txt', { type: 'text/plain' });
    setSelectedFile(file);
    setError('');
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px' }}>
            <Sparkles size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Apache PDFBox + AI Extraction
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Lab Report Summarizer</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Upload raw medical lab PDFs or text results to extract clinical metrics and generate plain-English summaries.
          </p>
        </div>

        <button
          onClick={handleLoadSampleReport}
          className="btn btn-secondary btn-sm"
          id="btn-load-sample-report"
        >
          <Layers size={16} color="var(--primary)" />
          <span>Load Sample Metabolic Report</span>
        </button>
      </div>

      {/* Grid: Upload Box (Left) + Latest AI Extracted Summary (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* Upload Card */}
        <div className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileUp size={20} color="var(--primary)" />
            <span>Upload New Lab Report</span>
          </h2>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#FB7185',
              marginBottom: '1.25rem',
              fontSize: '0.85rem'
            }}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.15)',
              marginBottom: '1.5rem',
              cursor: 'pointer'
            }}>
              <Upload size={36} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>
                {selectedFile ? selectedFile.name : 'Select or drop PDF / text report'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Supports PDF (Apache PDFBox parsed), TXT up to 15MB
              </div>

              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                Browse Files
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={uploading || !selectedFile}
              id="btn-process-report"
            >
              <Sparkles size={16} />
              <span>{uploading ? 'Extracting Metrics with AI & PDFBox...' : 'Extract & Summarize Report'}</span>
            </button>
          </form>
        </div>

        {/* Latest Summary / Results View */}
        <div className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#10B981" />
            <span>AI Metric Extraction Analysis</span>
          </h2>

          {latestSummary ? (
            <div>
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-line'
              }}>
                {latestSummary.plainEnglishSummary}
              </div>

              {/* Parsed Metrics Table */}
              {latestSummary.keyMetrics && Object.keys(latestSummary.keyMetrics).length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Key Clinical Biomarkers
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                    {Object.entries(latestSummary.keyMetrics).map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: v.status === 'HIGH' ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '2px 0' }}>
                          {v.value} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>{v.unit}</span>
                        </div>
                        <span className={`badge badge-${v.status === 'HIGH' ? 'critical' : 'confirmed'}`} style={{ fontSize: '0.65rem' }}>
                          {v.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Extracted Text Preview */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Raw Extracted Document Text (PDFBox Output)
                </div>
                <pre style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-secondary)',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {latestSummary.rawExtractedText}
                </pre>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p>Upload a lab report or click "Load Sample Metabolic Report" above to trigger PDFBox extraction and AI clinical metric analysis.</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Uploaded Reports History */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>
          Document History ({reports.length})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="card"
              style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rep.fileName}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(rep.uploadedAt).toLocaleDateString()}
                </span>
              </div>

              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                marginBottom: '10px',
                maxHeight: '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {rep.extractedSummary}
              </p>

              <button
                onClick={() => setLatestSummary({
                  fileName: rep.fileName,
                  extractedSummary: rep.extractedSummary,
                  plainEnglishSummary: rep.extractedSummary,
                  rawExtractedText: rep.rawExtractedText
                })}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', width: '100%' }}
              >
                View Stored AI Summary
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
