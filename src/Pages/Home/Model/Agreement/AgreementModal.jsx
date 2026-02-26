import React, { useState } from 'react';
import { useModal } from '../ModalProvider'; // Changed from useModal to ModalProvider
import '../ModalStyles.scss';

const AgreementModal = () => {
  const { closeAgreementModal, openRegistrationModal } = useModal();
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [showCheckbox2, setShowCheckbox2] = useState(false);

  const handleDownloadPDF = () => {
    // Replace with your actual PDF URL
    const pdfUrl = '/termsandconditions.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Credence_Terms_Conditions.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setPdfDownloaded(true);
    setShowCheckbox2(true); // Show second checkbox AFTER download
  };

  const handleProceed = () => {
    console.log('Proceed clicked:', { agree1, agree2, pdfDownloaded });
    
    if (agree1 && agree2) {
      console.log('Opening registration modal...');
      openRegistrationModal();
    } else {
      console.log('Cannot proceed:', { agree1, agree2 });
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAgreementModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAgreementModal}>
          ×
        </button>

        <h2 className="modal-heading">Agreement & Terms</h2>

        <div className="agreement-content">
          <div className="agreement-list">
            <p><strong>Important Guidelines:</strong></p>
            <ol>
              <li>Please do not share your any details on any number other than mentioned in form.</li>
              <li>Please do not share photographs of RP card or social security number or any Eu id's.</li>
              <li>Make sure you have at least 75 euros balance in your bank account.</li>
              <li>Every Entrepreneur must take Pension Insurance if their income exceeds 9010 Euros in the respective financial Year.</li>
              <li>While doing application you need to be online for strong identification and answering query while processing.</li>
              <li>The service provider may share the client details (Company Name and/or Business ID) for the purpose of marketing, if needed. No other information will be shared by the service provider without prior consent from the client.</li>
              <li>Important note: you must check your email every day and see if there is any query from prh. If you fail to inform us about the query, you will lose your 70-euro trademark fees(trade register).</li>
              <li>You will receive follow-up from our back-office team for data uploads, VAT reporting, and any additional information required during monthly VAT compliance.</li>
            </ol>
          </div>

          {/* First Checkbox */}
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="agree1"
              checked={agree1}
              onChange={(e) => setAgree1(e.target.checked)}
              className="checkbox-input"
            />
            <label htmlFor="agree1" className="checkbox-label">
              I confirm that I have read and understood all the details and agree to follow all the rules and provide all required information and materials as needed.
            </label>
          </div>

          {/* Download Button - Only enabled when agree1 is checked */}
          <button
            className={`download-btn ${!agree1 ? 'disabled' : ''}`}
            onClick={handleDownloadPDF}
            disabled={!agree1}
          >
            Download Terms & Conditions PDF
          </button>

          {/* Second Checkbox - Only shown AFTER download */}
          {showCheckbox2 && (
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="agree2"
                checked={agree2}
                onChange={(e) => setAgree2(e.target.checked)}
                className="checkbox-input"
              />
              <label htmlFor="agree2" className="checkbox-label">
                I have downloaded, read, and understood the Terms & Conditions and information provided in the PDF, and I agree to them.
              </label>
            </div>
          )}

          {/* Proceed Button - Only enabled when both checkboxes are checked */}
          <button
            className={`proceed-btn ${!(agree1 && agree2) ? 'disabled' : ''}`}
            onClick={handleProceed}
            disabled={!(agree1 && agree2)}
          >
            Proceed to Registration
          </button>

          {/* Validation Message */}
          {!(agree1 && agree2) && (
            <p className="validation-msg">
              {!agree1 ? 'Please tick the first checkbox.' : 
               !agree2 ? 'Please download the PDF and tick the second checkbox.' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgreementModal;