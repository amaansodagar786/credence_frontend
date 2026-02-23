import { useEffect, useState } from "react";

const CLIENT_ID = "710484139378-99ujcsjinrm9iuf9e6qjgr3040sqr9rf.apps.googleusercontent.com";

export default function GoogleDriveModule({ onFileSelect }) {
    const [accessToken, setAccessToken] = useState(null);
    const [currentFolderId, setCurrentFolderId] = useState("root");
    const [folderHistory, setFolderHistory] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [userName, setUserName] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const authenticate = () => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email",
            prompt: "select_account consent",
            callback: async (response) => {
                if (response.error) {
                    alert("Authentication failed: " + response.error);
                    console.error("Auth error:", response);
                    return;
                }

                console.log("✅ Token received");
                setAccessToken(response.access_token);
                setIsAuthenticated(true);

                // Get user info first
                await fetchUserInfo(response.access_token);
                // Then fetch files with the same token
                await fetchFolderContents("root", response.access_token);
            },
        });
        tokenClient.requestAccessToken();
    };

    const fetchUserInfo = async (token) => {
        try {
            const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            console.log("👤 User info:", data);
            if (data.email) {
                setUserEmail(data.email);
                setUserName(data.name);
            }
        } catch (err) {
            console.error("Failed to fetch user info", err);
        }
    };

    const fetchFolderContents = async (folderId, token) => {
        if (!token) {
            console.error("No token provided to fetchFolderContents");
            return;
        }

        setLoading(true);
        try {
            // FIXED: Added single quotes around folderId and spaces around =
            const query = folderId === "root"
                ? "'root' in parents and trashed = false"
                : `'${folderId}' in parents and trashed = false`;

            const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=100&fields=files(id,name,mimeType,size,thumbnailLink)`;

            console.log("📁 Fetching with query:", query);

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error("Drive API error:", response.status, errorData);
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log("📄 Drive API response:", data);

            const files = data.files || [];
            const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
            const nonFolders = files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
            setItems([...folders, ...nonFolders]);
        } catch (err) {
            console.error("Fetch error:", err);
            alert("Failed to fetch folder contents. Check console for details.");
        }
        setLoading(false);
    };

    const openFolder = (folderId) => {
        setFolderHistory([...folderHistory, currentFolderId]);
        setCurrentFolderId(folderId);
        fetchFolderContents(folderId, accessToken);
        setSelectedIds([]);
    };

    const goBack = () => {
        if (folderHistory.length === 0) return;
        const prevFolder = folderHistory[folderHistory.length - 1];
        setFolderHistory(folderHistory.slice(0, -1));
        setCurrentFolderId(prevFolder);
        fetchFolderContents(prevFolder, accessToken);
        setSelectedIds([]);
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
        );
    };

    const downloadSelected = async () => {
        if (!accessToken) return;

        for (const id of selectedIds) {
            const item = items.find((i) => i.id === id);
            if (item.mimeType === 'application/vnd.google-apps.folder') continue;

            try {
                const response = await fetch(
                    "http://localhost:3043/api/google-drive-proxy",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            fileId: item.id,
                            accessToken,
                        }),
                    }
                );

                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const blob = await response.blob();
                const finalFile = new File([blob], item.name, {
                    type: blob.type || item.mimeType,
                });
                onFileSelect(finalFile);
            } catch (err) {
                alert("Download failed: " + item.name);
                console.error(err);
            }
        }
        setSelectedIds([]);
    };

    const signOut = () => {
        if (accessToken) {
            window.google.accounts.oauth2.revoke(accessToken, () => {
                console.log("🔓 Token revoked");
                setAccessToken(null);
                setIsAuthenticated(false);
                setItems([]);
                setSelectedIds([]);
                setUserEmail(null);
                setUserName(null);
                setCurrentFolderId("root");
                setFolderHistory([]);
            });
        }
    };

    return (
        <div className="drive-module">
            {!isAuthenticated && (
                <button className="google-drive-btn" onClick={authenticate}>
                    Connect Google Drive
                </button>
            )}

            {isAuthenticated && userEmail && (
                <div className="user-info">
                    <span>✅ Logged in as: <strong>{userEmail}</strong> {userName && `(${userName})`}</span>
                    <button onClick={signOut} className="signout-btn">Sign Out</button>
                </div>
            )}

            {isAuthenticated && (
                <div className="drive-container">
                    <div className="drive-header">
                        <div>
                            {folderHistory.length > 0 && (
                                <button onClick={goBack} className="back-btn">⬅ Back</button>
                            )}
                        </div>
                        {selectedIds.length > 0 && (
                            <button className="add-selected-btn" onClick={downloadSelected}>
                                Add {selectedIds.length} File(s)
                            </button>
                        )}
                    </div>

                    {loading && <p className="loading-text">Loading...</p>}

                    {!loading && items.length === 0 && (
                        <p className="empty-folder">This folder is empty.</p>
                    )}

                    <div className="drive-list">
                        {items.map((item) => {
                            const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
                            return (
                                <div key={item.id} className="drive-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => toggleSelect(item.id)}
                                        disabled={isFolder}
                                    />
                                    <div
                                        className="file-info"
                                        onClick={() => isFolder && openFolder(item.id)}
                                    >
                                        <span className="file-name">
                                            {isFolder ? "📁 " : "📄 "}{item.name}
                                        </span>
                                        {!isFolder && item.size && (
                                            <span className="file-size">
                                                {Math.round(item.size / 1024)} KB
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}