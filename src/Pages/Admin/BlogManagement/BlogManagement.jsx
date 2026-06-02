import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminLayout from "../../Admin/Layout/AdminLayout";
import {
    FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiUpload,
    FiRefreshCw, FiImage, FiType, FiCalendar, FiClock,
    FiFolder, FiFileText, FiTrash, FiBold, FiItalic, FiUnderline,
    FiAlertCircle
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./BlogManagement.scss";

// ============================================
// RICH EDITOR COMPONENT (FIXED - STRIPS UNWANTED STYLES)
// ============================================
const RichEditor = ({ index, initialHtml, onChange, placeholder, onSyncFormat }) => {
    const ref = useRef(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (ref.current && !isInitialized.current) {
            ref.current.innerHTML = initialHtml || "";
            isInitialized.current = true;
        }
    }, []);

    // Clean HTML - remove font-family, font-size, line-height, color, background, etc.
    const cleanPastedHTML = (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const allElements = tempDiv.querySelectorAll('*');
        allElements.forEach(el => {
            el.removeAttribute('style');
            el.removeAttribute('class');
            el.removeAttribute('id');
            const dataAttrs = [...el.attributes].filter(attr => attr.name.startsWith('data-'));
            dataAttrs.forEach(attr => el.removeAttribute(attr.name));
        });

        const unwantedTags = ['span', 'div', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav'];
        unwantedTags.forEach(tag => {
            const elements = tempDiv.querySelectorAll(tag);
            elements.forEach(el => {
                const parent = el.parentNode;
                while (el.firstChild) {
                    parent.insertBefore(el.firstChild, el);
                }
                parent.removeChild(el);
            });
        });

        let cleanedHtml = tempDiv.innerHTML;
        cleanedHtml = cleanedHtml.replace(/(<br\s*\/?>){2,}/gi, '<br>');
        cleanedHtml = cleanedHtml.replace(/<p>\s*<\/p>/gi, '');

        return cleanedHtml || '<p><br></p>';
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedHtml = e.clipboardData.getData('text/html');
        const pastedText = e.clipboardData.getData('text/plain');

        let contentToInsert = '';

        if (pastedHtml) {
            contentToInsert = cleanPastedHTML(pastedHtml);
        } else if (pastedText) {
            contentToInsert = `<p>${pastedText.replace(/\n/g, '<br>')}</p>`;
        }

        if (contentToInsert) {
            document.execCommand('insertHTML', false, contentToInsert);
            if (ref.current) {
                onChange(index, ref.current.innerHTML);
            }
        }
    };

    const handleInput = () => {
        if (ref.current) {
            let currentHtml = ref.current.innerHTML;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = currentHtml;
            const allElements = tempDiv.querySelectorAll('[style]');
            allElements.forEach(el => el.removeAttribute('style'));
            const cleaned = tempDiv.innerHTML;
            if (cleaned !== currentHtml) {
                ref.current.innerHTML = cleaned;
            }
            onChange(index, ref.current.innerHTML);

            if (onSyncFormat) {
                setTimeout(() => onSyncFormat(index), 10);
            }
        }
    };

    const handleMouseUp = () => {
        if (onSyncFormat) {
            setTimeout(() => onSyncFormat(index), 10);
        }
    };

    const handleKeyUp = () => {
        if (onSyncFormat) {
            setTimeout(() => onSyncFormat(index), 10);
        }
    };

    const handleFocus = () => {
        if (onSyncFormat) {
            setTimeout(() => onSyncFormat(index), 10);
        }
    };

    return (
        <div
            ref={ref}
            id={`editor-${index}`}
            className="rich-editor"
            contentEditable
            dir="ltr"
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={handleInput}
            onPaste={handlePaste}
            onMouseUp={handleMouseUp}
            onKeyUp={handleKeyUp}
            onFocus={handleFocus}
            data-placeholder={placeholder || "Write your paragraph content here..."}
        />
    );
};

const BlogManagement = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);

    const [formData, setFormData] = useState({
        blogId: "",
        title: "",
        rawDate: "",
        rawTime: "",
        date: "",
        time: "",
        category: "",
        coverImage: "",
        content: []
    });

    const [errors, setErrors] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // Per-paragraph format state
    const [paragraphFormats, setParagraphFormats] = useState({});

    // Function to update format for specific paragraph
    const updateParagraphFormat = (index, command, value) => {
        setParagraphFormats(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [command]: value
            }
        }));
    };

    // Function to sync format state from editor selection
    const syncFormatForParagraph = (index) => {
        const editorDiv = document.getElementById(`editor-${index}`);
        if (editorDiv && document.activeElement === editorDiv) {
            const bold = document.queryCommandState('bold');
            const italic = document.queryCommandState('italic');
            const underline = document.queryCommandState('underline');

            setParagraphFormats(prev => ({
                ...prev,
                [index]: { bold, italic, underline }
            }));
        }
    };

    // ============================================
    // FETCH ALL BLOGS
    // ============================================
    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs`, { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                if (data.success) setBlogs(data.blogs);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Failed to load blogs");
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================
    // UPLOAD IMAGE TO S3
    // ============================================
    const handleImageUpload = async (file) => {
        const formDataImg = new FormData();
        formDataImg.append("image", file);
        setUploadingImage(true);
        const toastId = toast.loading("Uploading image...");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/upload-image`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },
                credentials: "include",
                body: formDataImg
            });
            const data = await response.json();
            if (response.ok && data.success) {
                toast.update(toastId, { render: "✅ Image uploaded successfully!", type: "success", isLoading: false, autoClose: 3000 });
                return data.imageUrl;
            } else {
                toast.update(toastId, { render: `❌ ${data.message || "Upload failed"}`, type: "error", isLoading: false, autoClose: 3000 });
                return null;
            }
        } catch (error) {
            toast.update(toastId, { render: `❌ Upload error: ${error.message}`, type: "error", isLoading: false, autoClose: 3000 });
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            if (file.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, coverImage: "Image size must be less than 5MB" })); return; }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setErrors(p => ({ ...p, coverImage: "" }));
        } else {
            setErrors(p => ({ ...p, coverImage: "Please select a valid image file" }));
        }
    };

    // ============================================
    // CONTENT BLOCK HANDLERS
    // ============================================
    const addContentBlock = () => {
        setFormData(prev => ({ ...prev, content: [...prev.content, { type: "paragraph", html: "" }] }));
    };

    const removeContentBlock = (index) => {
        setFormData(prev => {
            const newContent = [...prev.content];
            newContent.splice(index, 1);
            return { ...prev, content: newContent };
        });
        // Also remove format state for this paragraph
        setParagraphFormats(prev => {
            const newFormats = { ...prev };
            delete newFormats[index];
            return newFormats;
        });
    };

    const updateContentHtml = (index, html) => {
        setFormData(prev => {
            const newContent = [...prev.content];
            newContent[index] = { ...newContent[index], html };
            return { ...prev, content: newContent };
        });
    };

    // ============================================
    // VALIDATE FORM
    // ============================================
    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.time) newErrors.time = "Time is required";
        if (!formData.category.trim()) newErrors.category = "Category is required";
        if (!formData.coverImage && !selectedImage) newErrors.coverImage = "Cover image is required";
        if (formData.content.length === 0) {
            newErrors.content = "At least one paragraph is required";
        } else {
            const empty = formData.content.filter(p => !p.html || p.html.trim() === "" || p.html === "<br>");
            if (empty.length > 0) newErrors.content = "All paragraphs must have content";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const processContent = (content) => content.map(block => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = block.html;
        const plainText = tempDiv.innerText;
        const underlineEl = tempDiv.querySelector('u, ins');
        return { type: "paragraph", text: plainText, underline: underlineEl ? underlineEl.innerText : null, html: block.html };
    });

    // ============================================
    // CREATE BLOG
    // ============================================
    const handleCreateBlog = async (e) => {
        e.preventDefault();
        if (!validateForm()) { toast.error("Please fix the validation errors"); return; }

        let finalImageUrl = formData.coverImage;
        if (selectedImage) {
            const url = await handleImageUpload(selectedImage);
            if (!url) return;
            finalImageUrl = url;
        }

        setSubmitting(true);
        const toastId = toast.loading("Creating blog...");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },
                credentials: "include",
                body: JSON.stringify({
                    title: formData.title,
                    date: formData.date,
                    time: formData.time,
                    category: formData.category,
                    coverImage: finalImageUrl,
                    content: processContent(formData.content)
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                toast.update(toastId, { render: "✅ Blog created successfully!", type: "success", isLoading: false, autoClose: 3000 });
                resetForm();
                setShowCreateModal(false);
                fetchBlogs();
            } else {
                toast.update(toastId, { render: `❌ ${data.message || "Creation failed"}`, type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(toastId, { render: `❌ Error: ${error.message}`, type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================
    // UPDATE BLOG
    // ============================================
    const handleUpdateBlog = async (e) => {
        e.preventDefault();
        if (!validateForm()) { toast.error("Please fix the validation errors"); return; }

        let finalImageUrl = formData.coverImage;
        if (selectedImage) {
            const url = await handleImageUpload(selectedImage);
            if (!url) return;
            finalImageUrl = url;
        }

        setSubmitting(true);
        const toastId = toast.loading("Updating blog...");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/${formData.blogId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },
                credentials: "include",
                body: JSON.stringify({
                    title: formData.title,
                    date: formData.date,
                    time: formData.time,
                    category: formData.category,
                    coverImage: finalImageUrl,
                    content: processContent(formData.content)
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                toast.update(toastId, { render: "✅ Blog updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
                resetForm();
                setShowEditModal(false);
                fetchBlogs();
            } else {
                toast.update(toastId, { render: `❌ ${data.message || "Update failed"}`, type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(toastId, { render: `❌ Error: ${error.message}`, type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================
    // DELETE BLOG
    // ============================================
    const handleDeleteBlog = async () => {
        setSubmitting(true);
        const toastId = toast.loading("Deleting blog...");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/${selectedBlog.blogId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },
                credentials: "include"
            });
            const data = await response.json();
            if (response.ok && data.success) {
                toast.update(toastId, { render: "✅ Blog deleted successfully!", type: "success", isLoading: false, autoClose: 3000 });
                setShowDeleteModal(false);
                setSelectedBlog(null);
                fetchBlogs();
            } else {
                toast.update(toastId, { render: `❌ ${data.message || "Deletion failed"}`, type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(toastId, { render: `❌ Error: ${error.message}`, type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================
    // OPEN MODALS
    // ============================================
    const openViewModal = (blog) => {
        setSelectedBlog(blog);
        setShowViewModal(true);
    };

    const openEditModal = (blog) => {
        setSelectedBlog(blog);

        let rawDate = "";
        if (blog.date) {
            try {
                const d = new Date(blog.date);
                if (!isNaN(d)) rawDate = d.toISOString().split('T')[0];
            } catch { rawDate = ""; }
        }

        let rawTime = "";
        if (blog.time) {
            const match = blog.time.match(/(\d+):(\d+)\s*(am|pm)/i);
            if (match) {
                let hour = parseInt(match[1]);
                const minute = match[2];
                const ampm = match[3].toLowerCase();
                if (ampm === 'pm' && hour !== 12) hour += 12;
                if (ampm === 'am' && hour === 12) hour = 0;
                rawTime = `${hour.toString().padStart(2, '0')}:${minute}`;
            }
        }

        const contentWithHtml = (blog.content || []).map(block => ({
            type: "paragraph",
            html: block.html || block.text || ""
        }));

        setFormData({
            blogId: blog.blogId,
            title: blog.title,
            rawDate,
            rawTime,
            date: blog.date,
            time: blog.time,
            category: blog.category,
            coverImage: blog.coverImage,
            content: contentWithHtml
        });
        setImagePreview(blog.coverImage);
        setSelectedImage(null);
        setErrors({});
        setParagraphFormats({});
        setShowEditModal(true);
    };

    const openDeleteModal = (blog) => {
        setSelectedBlog(blog);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setFormData({
            blogId: "",
            title: "",
            rawDate: "",
            rawTime: "",
            date: "",
            time: "",
            category: "",
            coverImage: "",
            content: []
        });
        setSelectedImage(null);
        setImagePreview("");
        setErrors({});
        setParagraphFormats({});
    };

    useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

    // ============================================
    // SHARED FORM BODY
    // ============================================
    const renderFormBody = () => (
        <div className="blog-modal-body">
            {/* Cover Image */}
            <div className="form-group">
                <label><FiImage /> Cover Image *</label>
                <div className="image-upload-area">
                    {imagePreview ? (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Preview" />
                            <button type="button" className="remove-image" onClick={() => {
                                setImagePreview(""); setSelectedImage(null);
                                setFormData(prev => ({ ...prev, coverImage: "" }));
                            }}><FiX /></button>
                        </div>
                    ) : (
                        <label className="image-upload-label">
                            <FiUpload />
                            <span>Click to upload image (max 5MB)</span>
                            <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
                        </label>
                    )}
                </div>
                {errors.coverImage && <span className="error-text"><FiAlertCircle /> {errors.coverImage}</span>}
            </div>

            {/* Title */}
            <div className="form-group">
                <label><FiType /> Title *</label>
                <input type="text" placeholder="Enter blog title" value={formData.title}
                    onChange={(e) => { setFormData(prev => ({ ...prev, title: e.target.value })); setErrors(prev => ({ ...prev, title: "" })); }}
                    className={errors.title ? "error" : ""} />
                {errors.title && <span className="error-text"><FiAlertCircle /> {errors.title}</span>}
            </div>

            {/* Date and Time */}
            <div className="form-row">
                <div className="form-group">
                    <label><FiCalendar /> Date *</label>
                    <input
                        type="date"
                        value={formData.rawDate}
                        onChange={(e) => {
                            const raw = e.target.value;
                            if (!raw) { setFormData(prev => ({ ...prev, rawDate: "", date: "" })); return; }
                            const dateObj = new Date(raw + "T00:00");
                            const formatted = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                            setFormData(prev => ({ ...prev, rawDate: raw, date: formatted }));
                            setErrors(prev => ({ ...prev, date: "" }));
                        }}
                        className={errors.date ? "error" : ""}
                    />
                    {formData.date && <span className="date-display">{formData.date}</span>}
                    {errors.date && <span className="error-text"><FiAlertCircle /> {errors.date}</span>}
                </div>
                <div className="form-group">
                    <label><FiClock /> Time *</label>
                    <input
                        type="time"
                        value={formData.rawTime}
                        onChange={(e) => {
                            const raw = e.target.value;
                            if (!raw) { setFormData(prev => ({ ...prev, rawTime: "", time: "" })); return; }
                            const timeObj = new Date(`2000-01-01T${raw}`);
                            const formatted = timeObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                            setFormData(prev => ({ ...prev, rawTime: raw, time: formatted }));
                            setErrors(prev => ({ ...prev, time: "" }));
                        }}
                        className={errors.time ? "error" : ""}
                    />
                    {formData.time && <span className="date-display">{formData.time}</span>}
                    {errors.time && <span className="error-text"><FiAlertCircle /> {errors.time}</span>}
                </div>
            </div>

            {/* Category */}
            <div className="form-group">
                <label><FiFolder /> Category *</label>
                <input type="text" placeholder="e.g., Finnish Immigration Service" value={formData.category}
                    onChange={(e) => { setFormData(prev => ({ ...prev, category: e.target.value })); setErrors(prev => ({ ...prev, category: "" })); }}
                    className={errors.category ? "error" : ""} />
                {errors.category && <span className="error-text"><FiAlertCircle /> {errors.category}</span>}
            </div>

            {/* Content Paragraphs */}
            <div className="form-group">
                <label><FiFileText /> Content Paragraphs *</label>

                <div className="content-blocks">
                    {formData.content.map((block, index) => (
                        <div key={index} className="content-block">
                            <div className="block-header">
                                <span>Paragraph {index + 1}</span>
                                <div className="format-tools-inline">
                                    <button
                                        type="button"
                                        className={`format-btn ${paragraphFormats[index]?.bold ? 'active' : ''}`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            const editorDiv = document.getElementById(`editor-${index}`);
                                            if (editorDiv) {
                                                editorDiv.focus();
                                                setTimeout(() => {
                                                    document.execCommand('bold', false, null);
                                                    const isBold = document.queryCommandState('bold');
                                                    updateParagraphFormat(index, 'bold', isBold);
                                                    updateContentHtml(index, editorDiv.innerHTML);
                                                }, 10);
                                            }
                                        }}
                                        title="Bold (Ctrl+B)"
                                    >
                                        <FiBold />
                                    </button>
                                    <button
                                        type="button"
                                        className={`format-btn ${paragraphFormats[index]?.italic ? 'active' : ''}`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            const editorDiv = document.getElementById(`editor-${index}`);
                                            if (editorDiv) {
                                                editorDiv.focus();
                                                setTimeout(() => {
                                                    document.execCommand('italic', false, null);
                                                    const isItalic = document.queryCommandState('italic');
                                                    updateParagraphFormat(index, 'italic', isItalic);
                                                    updateContentHtml(index, editorDiv.innerHTML);
                                                }, 10);
                                            }
                                        }}
                                        title="Italic (Ctrl+I)"
                                    >
                                        <FiItalic />
                                    </button>
                                    <button
                                        type="button"
                                        className={`format-btn ${paragraphFormats[index]?.underline ? 'active' : ''}`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            const editorDiv = document.getElementById(`editor-${index}`);
                                            if (editorDiv) {
                                                editorDiv.focus();
                                                setTimeout(() => {
                                                    document.execCommand('underline', false, null);
                                                    const isUnderline = document.queryCommandState('underline');
                                                    updateParagraphFormat(index, 'underline', isUnderline);
                                                    updateContentHtml(index, editorDiv.innerHTML);
                                                }, 10);
                                            }
                                        }}
                                        title="Underline (Ctrl+U)"
                                    >
                                        <FiUnderline />
                                    </button>
                                </div>
                                <button type="button" className="remove-block" onClick={() => removeContentBlock(index)}>
                                    <FiTrash />
                                </button>
                            </div>
                            <RichEditor
                                key={`editor-${index}-${showCreateModal}-${showEditModal}`}
                                index={index}
                                initialHtml={block.html}
                                onChange={updateContentHtml}
                                onSyncFormat={syncFormatForParagraph}
                                placeholder="Write your paragraph content here..."
                            />
                        </div>
                    ))}
                    <button type="button" className="add-block-btn" onClick={addContentBlock}>
                        <FiPlus /> Add Paragraph
                    </button>
                    {errors.content && <span className="error-text"><FiAlertCircle /> {errors.content}</span>}
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <ToastContainer position="top-center" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />

            <div className="blog-management-container">
                <div className="blog-header">
                    <h1><FiFileText className="header-icon" /> Blog Management</h1>
                    <div className="header-actions">
                        <button className="btn-create" onClick={() => { resetForm(); setShowCreateModal(true); }}><FiPlus /> Create New Blog</button>
                        <button className="btn-refresh" onClick={fetchBlogs} disabled={loading}><FiRefreshCw className={loading ? "spinning" : ""} /> Refresh</button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Loading blogs...</div>
                ) : blogs.length === 0 ? (
                    <div className="empty-state">
                        <FiFileText className="empty-icon" />
                        <p>No blogs yet. Click "Create New Blog" to add your first blog.</p>
                    </div>
                ) : (
                    <div className="blog-grid">
                        {blogs.map((blog) => (
                            <div key={blog.blogId} className="blog-card">
                                <div className="blog-card-image"><img src={blog.coverImage} alt={blog.title} /></div>
                                <div className="blog-card-content">
                                    <h3 className="blog-card-title">{blog.title}</h3>
                                    <div className="blog-card-meta">
                                        <span className="blog-card-category">{blog.category}</span>
                                        <span className="blog-card-date">{blog.date}</span>
                                        <span className="blog-card-time">{blog.time}</span>
                                    </div>
                                    <div className="blog-card-actions">
                                        <button className="action-btn view" onClick={() => openViewModal(blog)}><FiEye /> View</button>
                                        <button className="action-btn edit" onClick={() => openEditModal(blog)}><FiEdit2 /> Edit</button>
                                        <button className="action-btn delete" onClick={() => openDeleteModal(blog)}><FiTrash2 /> Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* VIEW MODAL */}
            {showViewModal && selectedBlog && (
                <div className="blog-modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="blog-modal-content blog-view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="blog-modal-header">
                            <h2>View Blog</h2>
                            <button className="blog-modal-close-btn" onClick={() => setShowViewModal(false)}><FiX /></button>
                        </div>
                        <div className="blog-modal-body blog-view-body">
                            <div className="view-cover"><img src={selectedBlog.coverImage} alt={selectedBlog.title} /></div>
                            <div className="view-meta">
                                <span className="view-category">{selectedBlog.category}</span>
                                <span className="view-date">{selectedBlog.date}</span>
                                <span className="view-time">{selectedBlog.time}</span>
                            </div>
                            <h2 className="view-title">{selectedBlog.title}</h2>
                            <div className="view-content">
                                {(selectedBlog.content || []).map((block, idx) => (
                                    <div key={idx} className="view-paragraph" dangerouslySetInnerHTML={{ __html: block.html || block.text }} />
                                ))}
                            </div>
                        </div>
                        <div className="blog-modal-footer">
                            <button type="button" className="btn-cancel" onClick={() => setShowViewModal(false)}>Close</button>
                            <button type="button" className="btn-submit" onClick={() => { setShowViewModal(false); openEditModal(selectedBlog); }}><FiEdit2 /> Edit This Blog</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="blog-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="blog-modal-content blog-create-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="blog-modal-header">
                            <h2>Create New Blog</h2>
                            <button className="blog-modal-close-btn" onClick={() => setShowCreateModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleCreateBlog}>
                            {renderFormBody()}
                            <div className="blog-modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={submitting || uploadingImage}>{submitting ? "Creating..." : "Create Blog"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="blog-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="blog-modal-content blog-create-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="blog-modal-header">
                            <h2>Edit Blog</h2>
                            <button className="blog-modal-close-btn" onClick={() => setShowEditModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleUpdateBlog}>
                            {renderFormBody()}
                            <div className="blog-modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={submitting || uploadingImage}>{submitting ? "Updating..." : "Update Blog"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && selectedBlog && (
                <div className="blog-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="blog-modal-content blog-delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="blog-modal-header">
                            <h2>Delete Blog</h2>
                            <button className="blog-modal-close-btn" onClick={() => setShowDeleteModal(false)}><FiX /></button>
                        </div>
                        <div className="blog-modal-body">
                            <p>Are you sure you want to delete "<strong>{selectedBlog.title}</strong>"?</p>
                            <p className="delete-warning">This action cannot be undone.</p>
                        </div>
                        <div className="blog-modal-footer">
                            <button type="button" className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button type="button" className="btn-delete" onClick={handleDeleteBlog} disabled={submitting}>{submitting ? "Deleting..." : "Delete Permanently"}</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default BlogManagement;