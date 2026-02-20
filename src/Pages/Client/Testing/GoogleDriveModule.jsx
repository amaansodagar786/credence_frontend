// src/test-google/GoogleDriveModule.jsx
import { useEffect, useState } from "react";

const CLIENT_ID = "710484139378-99ujcsjinrm9iuf9e6qjgr3040sqr9rf.apps.googleusercontent.com";

export default function GoogleDriveModule({ onFileSelect }) {
    const [accessToken, setAccessToken] = useState(null);
    const [driveFiles, setDriveFiles] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const authenticate = () => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: "https://www.googleapis.com/auth/drive.readonly",
            callback: async (response) => {
                if (response.error) {
                    alert("Authentication failed");
                    return;
                }

                setAccessToken(response.access_token);
                fetchDriveFiles(response.access_token);
            },
        });

        tokenClient.requestAccessToken();
    };

    const fetchDriveFiles = async (token) => {
        setLoading(true);

        try {
            const response = await fetch(
                "https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,size)",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await response.json();
            setDriveFiles(data.files || []);
        } catch (err) {
            alert("Failed to fetch files");
        }

        setLoading(false);
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((fileId) => fileId !== id)
                : [...prev, id]
        );
    };

    const downloadSelected = async () => {
        for (const id of selectedIds) {
            const file = driveFiles.find((f) => f.id === id);

            try {
                const response = await fetch(
                    "http://localhost:3043/api/google-drive-proxy",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            fileId: file.id,
                            accessToken,
                        }),
                    }
                );

                const blob = await response.blob();

                const finalFile = new File([blob], file.name, {
                    type: blob.type || file.mimeType,
                });

                onFileSelect(finalFile);
            } catch (err) {
                alert("Download failed: " + file.name);
            }
        }

        setSelectedIds([]);
    };

    return (
        <div className="drive-module">
            {!accessToken && (
                <button className="google-drive-btn" onClick={authenticate}>
                    Connect Google Drive
                </button>
            )}

            {loading && <p>Loading files...</p>}

            {driveFiles.length > 0 && (
                <div className="drive-container">
                    <div className="drive-header">
                        <h3>Your Drive Files</h3>
                        {selectedIds.length > 0 && (
                            <button
                                className="add-selected-btn"
                                onClick={downloadSelected}
                            >
                                Add {selectedIds.length} File(s)
                            </button>
                        )}
                    </div>

                    <div className="drive-list">
                        {driveFiles.map((file) => (
                            <div key={file.id} className="drive-item">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(file.id)}
                                    onChange={() => toggleSelect(file.id)}
                                />

                                <div className="file-info">
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">
                                        {file.size
                                            ? `${Math.round(file.size / 1024)} KB`
                                            : "Google Doc"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}