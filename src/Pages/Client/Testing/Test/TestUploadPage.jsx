// src/test-google/TestUploadPage.jsx
import React, { useState } from "react";
import GoogleDriveModule from "../GoogleDriveModule";
import "./TestUploadPage.scss";

function TestUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileSelect = (file) => {
    setSelectedFiles(prev => [...prev, file]);
    setUploadStatus(`${file.name} added to list`);
  };

  const handleLocalFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    setUploadStatus(`${files.length} file(s) added from computer`);
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setUploadStatus("");
  };

  // Simulate upload (since you said you'll handle upload later)
  const simulateUpload = () => {
    if (selectedFiles.length === 0) {
      alert("No files to upload");
      return;
    }

    setUploading(true);
    setUploadStatus("Uploading...");

    // Simulate upload delay
    setTimeout(() => {
      setUploading(false);
      setUploadStatus(`✅ Success! ${selectedFiles.length} file(s) ready for upload`);
      // Don't clear files so you can see them
    }, 1500);
  };

  return (
    <div className="test-google-wrapper">
      <div className="test-card">
        <h1 className="test-title">📁 Google Drive Upload Test</h1>
        <p className="test-subtitle">Testing Google Drive integration separately</p>

        <div className="upload-options">
          {/* Google Drive Button */}
          <GoogleDriveModule onFileSelect={handleFileSelect} />

          <span className="or-divider">OR</span>

          {/* Local File Input */}
          <div className="local-upload">
            <label className="file-input-label">
              <input
                type="file"
                multiple
                onChange={handleLocalFileSelect}
                className="file-input-hidden"
              />
              <span className="file-input-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Choose from Computer
              </span>
            </label>
            <span className="input-hint">(Multiple files allowed)</span>
          </div>
        </div>

        {/* Status Message */}
        {uploadStatus && (
          <div className="status-message">
            {uploadStatus}
          </div>
        )}

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="selected-files-section">
            <div className="section-header">
              <h3>Selected Files ({selectedFiles.length})</h3>
              <button className="clear-btn" onClick={clearAll}>
                Clear All
              </button>
            </div>

            <div className="files-grid">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-preview-card">
                  <div className="file-icon">
                    {file.type?.includes('pdf') ? '📄' : 
                     file.type?.includes('image') ? '🖼️' : 
                     file.type?.includes('spreadsheet') ? '📊' : 
                     file.type?.includes('word') ? '📝' : '📁'}
                  </div>
                  
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">
                      <span>Size: {Math.round(file.size / 1024)} KB</span>
                      <span>Type: {file.type?.split('/')[1] || 'unknown'}</span>
                    </div>
                  </div>

                  <button 
                    className="remove-btn"
                    onClick={() => removeFile(index)}
                    title="Remove"
                  >
                    ×
                  </button>

                  {/* Image Preview */}
                  {file.type?.startsWith('image/') && (
                    <div className="image-preview">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="preview"
                        onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Button (for testing) */}
            <button 
              className="upload-btn"
              onClick={simulateUpload}
              disabled={uploading}
            >
              {uploading ? 'Processing...' : `Test Upload ${selectedFiles.length} File(s)`}
            </button>
          </div>
        )}

        {/* Empty State */}
        {selectedFiles.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <p>No files selected</p>
            <p className="empty-hint">Click Google Drive or Choose from Computer to start</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestUploadPage;