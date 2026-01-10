import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import { useModal } from '../ModalProvider';
import '../ModalStyles.scss';

const RegistrationModal = () => {
  const { closeRegistrationModal, selectedPlan } = useModal();

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      address: '',
      visaType: '',
      hasStrongId: '',
      mobile: '',
      email: '',
      businessAddress: '',
      bankAccount: '',
      bicCode: '',
      businessName: '',
      vatPeriod: '',
      businessNature: '',
      registerTrade: '',
      planSelected: selectedPlan || ''
    },
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      alert('Registration submitted successfully!');
      closeRegistrationModal();
    },
  });

  // Update formik values when selectedPlan changes
  useEffect(() => {
    if (selectedPlan) {
      formik.setFieldValue('planSelected', selectedPlan);
    }
  }, [selectedPlan]);

  const handleClose = (e) => {
    e.stopPropagation();
    closeRegistrationModal();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>×</button>

        <h2 className="modal-heading">Registration Form</h2>
        
        {/* Show selected plan info */}
        {selectedPlan && (
          <div className="selected-plan-info">
            <p>You are registering for: <strong>{selectedPlan} Plan</strong></p>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="registration-form">
          {/* Row 1: First Name & Last Name */}
          <div className="form-row">
            <input
              type="text"
              name="firstName"
              placeholder="FIRST NAME*"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              required
              className="form-input"
            />
            <input
              type="text"
              name="lastName"
              placeholder="LAST NAME*"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              required
              className="form-input"
            />
          </div>

          {/* Row 2: Permanent/Temporary Address */}
          <input
            type="text"
            name="address"
            placeholder="PERMANENT / TEMPORARY ADDRESS*"
            value={formik.values.address}
            onChange={formik.handleChange}
            required
            className="form-input full-width"
          />

          {/* Row 3: Visa Type & Strong ID (Desktop: same row, Mobile: stacked) */}
          <div className="form-row radio-row">
            <div className="radio-group">
              <p className="radio-label">VISA TYPE*</p>
              <div className="radio-options">
                <label>
                  <input
                    type="radio"
                    name="visaType"
                    value="A"
                    checked={formik.values.visaType === 'A'}
                    onChange={formik.handleChange}
                    required
                  />
                  <span>A</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="visaType"
                    value="B"
                    checked={formik.values.visaType === 'B'}
                    onChange={formik.handleChange}
                  />
                  <span>B</span>
                </label>
              </div>
            </div>

            <div className="radio-group">
              <p className="radio-label">STRONG IDENTIFICATION?*</p>
              <div className="radio-options">
                <label>
                  <input
                    type="radio"
                    name="hasStrongId"
                    value="yes"
                    checked={formik.values.hasStrongId === 'yes'}
                    onChange={formik.handleChange}
                    required
                  />
                  <span>Yes</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="hasStrongId"
                    value="no"
                    checked={formik.values.hasStrongId === 'no'}
                    onChange={formik.handleChange}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Row 4: Mobile & Email */}
          <div className="form-row">
            <input
              type="tel"
              name="mobile"
              placeholder="MOBILE NUMBER*"
              value={formik.values.mobile}
              onChange={formik.handleChange}
              required
              className="form-input"
            />
            <input
              type="email"
              name="email"
              placeholder="EMAIL ID*"
              value={formik.values.email}
              onChange={formik.handleChange}
              required
              className="form-input"
            />
          </div>

          {/* Row 5: Business Address */}
          <input
            type="text"
            name="businessAddress"
            placeholder="BUSINESS ADDRESS*"
            value={formik.values.businessAddress}
            onChange={formik.handleChange}
            required
            className="form-input full-width"
          />

          {/* Row 6: Bank Account */}
          <input
            type="text"
            name="bankAccount"
            placeholder="BANK ACCOUNT NUMBER*"
            value={formik.values.bankAccount}
            onChange={formik.handleChange}
            required
            className="form-input full-width"
          />

          {/* Row 7: BIC Code & Business Name */}
          <div className="form-row">
            <input
              type="text"
              name="bicCode"
              placeholder="BIC CODE*"
              value={formik.values.bicCode}
              onChange={formik.handleChange}
              required
              className="form-input"
            />
            <input
              type="text"
              name="businessName"
              placeholder="BUSINESS NAME / ID*"
              value={formik.values.businessName}
              onChange={formik.handleChange}
              required
              className="form-input"
            />
          </div>

          {/* Row 8: VAT Period & Nature of Business (Desktop: same row, Mobile: stacked) */}
          <div className="form-row radio-row">
            <div className="radio-group">
              <p className="radio-label">VAT REPORTING PERIOD*</p>
              <div className="radio-options">
                <label>
                  <input
                    type="radio"
                    name="vatPeriod"
                    value="monthly"
                    checked={formik.values.vatPeriod === 'monthly'}
                    onChange={formik.handleChange}
                    required
                  />
                  <span>Monthly</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="vatPeriod"
                    value="quarterly"
                    checked={formik.values.vatPeriod === 'quarterly'}
                    onChange={formik.handleChange}
                  />
                  <span>Quarterly</span>
                </label>
              </div>
            </div>

            <div className="radio-group">
              <p className="radio-label">NATURE OF BUSINESS*</p>
              <div className="radio-options">
                <label>
                  <input
                    type="radio"
                    name="businessNature"
                    value="posti"
                    checked={formik.values.businessNature === 'posti'}
                    onChange={formik.handleChange}
                    required
                  />
                  <span>Posti</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="businessNature"
                    value="wolt"
                    checked={formik.values.businessNature === 'wolt'}
                    onChange={formik.handleChange}
                  />
                  <span>Wolt</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="businessNature"
                    value="other"
                    checked={formik.values.businessNature === 'other'}
                    onChange={formik.handleChange}
                  />
                  <span>Other</span>
                </label>
              </div>
            </div>
          </div>

          {/* Row 9: Trade Register */}
          <div className="radio-group full-width-radio">
            <p className="radio-label">REGISTER IN TRADE REGISTER?*</p>
            <div className="radio-options">
              <label>
                <input
                  type="radio"
                  name="registerTrade"
                  value="yes"
                  checked={formik.values.registerTrade === 'yes'}
                  onChange={formik.handleChange}
                  required
                />
                <span>Yes</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="registerTrade"
                  value="no"
                  checked={formik.values.registerTrade === 'no'}
                  onChange={formik.handleChange}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Row 10: Plan Selection */}
          <div className="select-group">
            <select
              name="planSelected"
              value={formik.values.planSelected}
              onChange={formik.handleChange}
              required
              className="form-select"
            >
              <option value="">SELECT PLAN*</option>
              <option value="Lite">Lite</option>
              <option value="Taxi">Taxi</option>
              <option value="Premium">Premium</option>
              <option value="Pro">Pro</option>
              <option value="Restaurant">Restaurant</option>
            </select>
            {selectedPlan && (
              <p className="plan-note">Plan pre-selected based on your choice</p>
            )}
          </div>

          <button type="submit" className="submit-btn">
            SUBMIT REGISTRATION
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;