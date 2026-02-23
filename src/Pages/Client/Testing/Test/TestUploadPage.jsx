import React, { useState } from "react";
import GoogleDriveModule from "../GoogleDriveModule";
import "./TestUploadPage.scss";

function TestUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewFile, setPreviewFile] = useState(null); // { file, url }

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

  const previewFileHandler = (file) => {
    // Create object URL for the file blob
    const url = URL.createObjectURL(file);
    setPreviewFile({ file, url });
  };

  const closePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile.url);
      setPreviewFile(null);
    }
  };

  const simulateUpload = () => {
    if (selectedFiles.length === 0) {
      alert("No files to upload");
      return;
    }
    setUploading(true);
    setUploadStatus("Uploading...");
    setTimeout(() => {
      setUploading(false);
      setUploadStatus(`✅ Success! ${selectedFiles.length} file(s) ready for upload`);
    }, 1500);
  };

  return (
    <div className="test-google-wrapper">
      <div className="test-card">
        <h1 className="test-title">📁 Google Drive Upload Test</h1>
        <p className="test-subtitle">Testing Google Drive integration separately</p>

        <div className="upload-options">
          <GoogleDriveModule onFileSelect={handleFileSelect} />
          <span className="or-divider">OR</span>
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

        {uploadStatus && <div className="status-message">{uploadStatus}</div>}

        {selectedFiles.length > 0 && (
          <div className="selected-files-section">
            <div className="section-header">
              <h3>Selected Files ({selectedFiles.length})</h3>
              <button className="clear-btn" onClick={clearAll}>Clear All</button>
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
                    <div className="file-actions" style={{ marginTop: "5px" }}>
                      <button
                        className="preview-btn-small"
                        onClick={() => previewFileHandler(file)}
                        style={{ padding: "2px 8px", fontSize: "12px", marginRight: "5px" }}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFile(index)} title="Remove">×</button>

                  {file.type?.startsWith('image/') && (
                    <div className="image-preview">
                      <img src={URL.createObjectURL(file)} alt="preview" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button className="upload-btn" onClick={simulateUpload} disabled={uploading}>
              {uploading ? 'Processing...' : `Test Upload ${selectedFiles.length} File(s)`}
            </button>
          </div>
        )}

        {selectedFiles.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <p>No files selected</p>
            <p className="empty-hint">Click Google Drive or Choose from Computer to start</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="preview-modal" style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }} onClick={closePreview}>
          <div className="preview-content" style={{
            backgroundColor: "#fff", padding: "20px", borderRadius: "8px",
            maxWidth: "90%", maxHeight: "90%", overflow: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <strong>{previewFile.file.name}</strong>
              <button onClick={closePreview} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>×</button>
            </div>
            <div className="preview-body">
              {previewFile.file.type?.startsWith('image/') ? (
                <img src={previewFile.url} alt="preview" style={{ maxWidth: "100%", maxHeight: "70vh" }} />
              ) : previewFile.file.type === 'application/pdf' ? (
                <iframe src={previewFile.url} title="pdf preview" style={{ width: "100%", height: "70vh", border: "none" }} />
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <p>Preview not available for this file type.</p>
                  <p>You can still upload it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestUploadPage;