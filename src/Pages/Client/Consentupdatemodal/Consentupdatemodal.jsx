import { useState, useEffect } from "react";
import { FiFileText, FiDownload, FiCheckCircle, FiShield, FiAlertTriangle } from "react-icons/fi";
import "./ConsentUpdateModal.scss";

const ConsentUpdateModal = () => {
    const [show, setShow] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [pdfDownloaded, setPdfDownloaded] = useState(false);
    const [checkingConsent, setCheckingConsent] = useState(true);

    // ============================================
    // CHECK IF CLIENT NEEDS CONSENT UPDATE
    // ============================================
    useEffect(() => {
        const checkConsent = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/client-consent/check`,
                    { credentials: "include" }
                );
                const data = await res.json();

                if (data.success && data.requiresConsentUpdate) {
                    setShow(true);
                }
            } catch (error) {
                console.error("Consent check failed:", error);
            } finally {
                setCheckingConsent(false);
            }
        };

        checkConsent();
    }, []);

    // ============================================
    // DOWNLOAD PDF AS BLOB — URL never shown to user
    // ============================================
    const handleDownload = async () => {
        if (downloading) return;
        try {
            setDownloading(true);

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/pdf/public/current`,
                { credentials: "include" }
            );
            const data = await res.json();

            if (!data.success) {
                alert("Agreement PDF not available. Please try again later.");
                return;
            }

            const fileResponse = await fetch(data.pdf.fileUrl);
            const blob = await fileResponse.blob();

            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = "Updated_Agreement.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

            setPdfDownloaded(true);
        } catch (error) {
            console.error("Download error:", error);
            alert("Failed to download agreement. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    // ============================================
    // SUBMIT CONSENT
    // ============================================
    const handleSubmit = async () => {
        if (!agreed || submitting) return;

        try {
            setSubmitting(true);

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/client-consent/accept`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" }
                }
            );

            const data = await res.json();

            if (data.success) {
                setShow(false);
            } else {
                alert("Failed to save your consent. Please try again.");
            }
        } catch (error) {
            console.error("Consent submit error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Don't render anything if still checking or not needed
    if (checkingConsent || !show) return null;

    return (
        <div className="consent-modal-overlay">
            <div className="consent-modal">

                {/* Header */}
                <div className="consent-modal-header">
                    <div className="consent-header-icon">
                        <FiShield size={28} />
                    </div>
                    <div className="consent-header-text">
                        <h2>Agreement Updated</h2>
                        <p>Our Terms & Conditions have been updated</p>
                    </div>
                </div>

                {/* Alert Banner */}
                <div className="consent-alert-banner">
                    <FiAlertTriangle size={18} />
                    <span>
                        Please review and accept the updated agreement to continue using the portal.
                        This popup cannot be dismissed until you accept.
                    </span>
                </div>

                {/* Body */}
                <div className="consent-modal-body">

                    {/* Step 1 — Download */}
                    <div className={`consent-step ${pdfDownloaded ? "done" : ""}`}>
                        <div className="consent-step-number">
                            {pdfDownloaded ? <FiCheckCircle size={20} /> : "1"}
                        </div>
                        <div className="consent-step-content">
                            <h4>Download & Read the Agreement</h4>
                            <p>Download the updated Terms & Conditions PDF and read it carefully.</p>
                            <button
                                className={`consent-download-btn ${downloading ? "loading" : ""} ${pdfDownloaded ? "downloaded" : ""}`}
                                onClick={handleDownload}
                                disabled={downloading}
                            >
                                <FiDownload size={16} />
                                {downloading
                                    ? "Downloading..."
                                    : pdfDownloaded
                                        ? "Downloaded ✓"
                                        : "Download Agreement PDF"
                                }
                            </button>
                        </div>
                    </div>

                    {/* Step 2 — Agree */}
                    <div className={`consent-step ${agreed ? "done" : ""} ${!pdfDownloaded ? "disabled" : ""}`}>
                        <div className="consent-step-number">
                            {agreed ? <FiCheckCircle size={20} /> : "2"}
                        </div>
                        <div className="consent-step-content">
                            <h4>Accept the Agreement</h4>
                            <p>Confirm that you have read and agree to the updated terms.</p>
                            <div
                                className={`consent-checkbox-row ${!pdfDownloaded ? "locked" : ""}`}
                                onClick={() => pdfDownloaded && setAgreed(!agreed)}
                            >
                                <div className={`consent-checkbox ${agreed ? "checked" : ""}`}>
                                    {agreed && <FiCheckCircle size={14} />}
                                </div>
                                <label>
                                    I have downloaded, read, and understood the updated Terms &amp; Conditions
                                    and I agree to be bound by them.
                                </label>
                            </div>
                            {!pdfDownloaded && (
                                <p className="consent-locked-hint">
                                    Please download the PDF first to enable this step.
                                </p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="consent-modal-footer">
                    <button
                        className={`consent-submit-btn ${!agreed || submitting ? "disabled" : ""}`}
                        onClick={handleSubmit}
                        disabled={!agreed || submitting}
                    >
                        {submitting ? "Saving..." : "Confirm & Continue"}
                    </button>
                    <p className="consent-footer-note">
                        <FiFileText size={13} />
                        Your acceptance is recorded with date, time, and IP address for compliance purposes.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ConsentUpdateModal;