// GoogleDriveTest.jsx
import React, { useState } from 'react';
import { FaGoogleDrive } from "react-icons/fa";

const GoogleDriveTest = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // 🔴 REPLACE THESE WITH YOUR ACTUAL CREDENTIALS
    const API_KEY = 'AIzaSyCdQwRvAk4gopJ_GHK_q0_b30iNH57jv04'; // Your API key
    const CLIENT_ID = '832489062290-aiq5plqf3ugcs60re5189nrofnfqo0rp.apps.googleusercontent.com'; // Your Client ID
    const APP_ID = '832489062290'; // Your Project Number

    const openGoogleDrivePicker = () => {
        setStatus('Loading Google API...');
        setLoading(true);

        // Load Google API script
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            setStatus('API loaded, initializing...');
            window.gapi.load('auth', { callback: onAuthApiLoad });
            window.gapi.load('picker', { callback: onPickerApiLoad });
        };
        script.onerror = () => {
            setStatus('Failed to load Google API');
            setLoading(false);
        };
        document.body.appendChild(script);
    };

    const onAuthApiLoad = () => {
        setStatus('Requesting permission...');
        window.gapi.auth.authorize(
            {
                client_id: CLIENT_ID,
                scope: ['https://www.googleapis.com/auth/drive.readonly'],
                immediate: false,
            },
            handleAuthResult
        );
    };

    const onPickerApiLoad = () => {
        setStatus('Picker ready');
    };

    const handleAuthResult = (authResult) => {
        setLoading(false);
        
        if (authResult && !authResult.error) {
            setStatus('Permission granted, opening picker...');
            
            const picker = new window.google.picker.PickerBuilder()
                .addView(window.google.picker.ViewId.DOCS)
                .addView(window.google.picker.ViewId.PDFS)
                .addView(window.google.picker.ViewId.IMAGES)
                .addView(window.google.picker.ViewId.SPREADSHEETS)
                .setOAuthToken(authResult.access_token)
                .setDeveloperKey(API_KEY)
                .setAppId(APP_ID)
                .setCallback(pickerCallback)
                .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
                .build();
            
            picker.setVisible(true);
        } else {
            setStatus('Error: ' + (authResult?.error || 'Permission denied'));
            console.error('Auth error:', authResult);
        }
    };

    const pickerCallback = (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
            const files = data.docs;
            setSelectedFiles(files);
            setStatus(`Selected ${files.length} file(s)!`);
            console.log('Selected files:', files);
        } else if (data.action === window.google.picker.Action.CANCEL) {
            setStatus('Picker cancelled');
        }
    };

    return (
        <div className="google-drive-test">
            <h2>Google Drive Upload Test</h2>
            
            <div className="credentials-info">
                <h3>Your Credentials:</h3>
                <p><strong>API Key:</strong> {API_KEY.substring(0, 10)}... (hidden for security)</p>
                <p><strong>Client ID:</strong> {CLIENT_ID.substring(0, 10)}... (hidden)</p>
                <p><strong>App ID:</strong> {APP_ID}</p>
            </div>

            <button 
                onClick={openGoogleDrivePicker}
                disabled={loading}
                className="google-drive-btn"
            >
                <FaGoogleDrive  size={20} />
                {loading ? 'Loading...' : 'Open Google Drive Picker'}
            </button>

            {status && (
                <div className="status-message">
                    Status: {status}
                </div>
            )}

            {selectedFiles.length > 0 && (
                <div className="selected-files">
                    <h3>Selected Files ({selectedFiles.length})</h3>
                    <div className="files-list">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                                <div className="file-icon">
                                    {file.mimeType.includes('pdf') ? '📄' : 
                                     file.mimeType.includes('image') ? '🖼️' : 
                                     file.mimeType.includes('spreadsheet') ? '📊' : '📁'}
                                </div>
                                <div className="file-details">
                                    <div className="file-name">{file.name}</div>
                                    <div className="file-meta">
                                        <span>ID: {file.id.substring(0, 15)}...</span>
                                        <span>Size: {Math.round(file.sizeBytes / 1024)} KB</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="note-box">
                        <strong>⚠️ Note:</strong> These are just file references. 
                        To actually upload these files, you need a backend server.
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleDriveTest;