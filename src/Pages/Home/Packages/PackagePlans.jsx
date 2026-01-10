import React, { useState } from "react";
import "./PackagePlans.scss";
import { useModal } from "../Model/ModalProvider";

const PackagePlans = () => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    companyName: "",
    selectedService: ""
  });

  // Get modal functions
  const { openAgreementModal } = useModal();

  const serviceOptions = [
    "New Tax Card / New Tax Declaration / Amendment",
    "Salary Processing (Palkka)",
    "Financial Statement (Interim / Year-End) – Toiminimi",
    "Financial Statement (Interim / Year-End) – OY",
    "Tax Return (Year-End)",
    "Other Accounting Services"
  ];

  // Handle Select Plan button click
  const handleSelectPlan = (planName) => {
    console.log('Selected plan:', planName);
    openAgreementModal(planName);
  };

  const handleOpenModal = () => {
    setIsConnectModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsConnectModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you! We will connect with you shortly.");
    setFormData({
      name: "",
      email: "",
      mobile: "",
      companyName: "",
      selectedService: ""
    });
    handleCloseModal();
  };

  return (
    <>
      <section className="packages">
        <div className="packages-header">
          <h2>Package Plans</h2>
          <span className="underline"></span>
          <p>Monthly Fixed Pricing | VAT Excluded</p>
        </div>

        <div className="table-wrapper">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Features</th>
                <th>Lite</th>
                <th>Taxi</th>
                <th>Premium</th>
                <th>Pro</th>
                <th>Restaurant</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="features">Monthly Price</td>
                <td className="lite">€40</td>
                <td className="taxi">€45</td>
                <td className="premium">€50</td>
                <td className="pro">€60</td>
                <td className="restaurant">€80</td>
              </tr>

              <tr>
                <td className="features">Income Sources Covered</td>
                <td className="lite">1</td>
                <td className="taxi">1</td>
                <td className="premium">2</td>
                <td className="pro">3</td>
                <td className="restaurant">1</td>
              </tr>

              <tr>
                <td className="features">Outgoing Invoices</td>
                <td className="lite">Up to 2</td>
                <td className="taxi">Up to 4</td>
                <td className="premium">Up to 4</td>
                <td className="pro">Up to 8</td>
                <td className="restaurant">Up to 10</td>
              </tr>

              <tr>
                <td className="features">Expense Receipts</td>
                <td className="lite">Up to 10</td>
                <td className="taxi">Up to 40</td>
                <td className="premium">Up to 40</td>
                <td className="pro">Up to 50</td>
                <td className="restaurant">Up to 50</td>
              </tr>

              <tr>
                <td className="features">Support Availability</td>
                <td className="lite">Mon–Fri (9am–4pm)</td>
                <td className="taxi">Mon–Fri (9am–4pm)</td>
                <td className="premium">Mon–Fri (9am–4pm)</td>
                <td className="pro">Mon–Fri (9am–4pm)</td>
                <td className="restaurant">Mon–Fri (9am–4pm)</td>
              </tr>

              <tr>
                <td className="features invoice-cell">Invoice Generation via Email</td>
                <td className="lite invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <button onClick={() => handleSelectPlan('Lite')}>
                      Select Plan
                    </button>
                  </div>
                </td>
                <td className="taxi invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <button onClick={() => handleSelectPlan('Taxi')}>
                      Select Plan
                    </button>
                  </div>
                </td>
                <td className="premium invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <button onClick={() => handleSelectPlan('Premium')}>
                      Select Plan
                    </button>
                  </div>
                </td>
                <td className="pro invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <button onClick={() => handleSelectPlan('Pro')}>
                      Select Plan
                    </button>
                  </div>
                </td>
                <td className="restaurant invoice-cell">
                  <div className="cell-content">
                    <span className="no">✖ No</span>
                    <button onClick={() => handleSelectPlan('Restaurant')}>
                      Select Plan
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="additional-services">
        <div className="section-header">
          <h2>Additional Services & Charges</h2>
          <span className="underline"></span>
          <p>Applicable only when required | Prices exclude VAT</p>
        </div>

        <div className="services-box">
          <div className="service-col">
            <h3>Additional Service</h3>
            <ul>
              <li>New Tax Card / New Tax Declaration / Amendment</li>
              <li>Salary Processing (Palkka)</li>
              <li>Financial Statement (Interim / Year-End) – Toiminimi</li>
              <li>Financial Statement (Interim / Year-End) – OY</li>
              <li>Tax Return (Year-End)</li>
              <li>Other Accounting Services</li>
            </ul>
          </div>

          <div className="divider"></div>

          <div className="service-col">
            <h3>Price (Excl. VAT)</h3>
            <ul>
              <li>€25</li>
              <li>€20 per salary</li>
              <li>Equivalent to <b>1 month's accounting fee</b></li>
              <li>€150</li>
              <li>Equivalent to <b>1 month's accounting fee</b></li>
              <li>€50 per hour</li>
            </ul>
          </div>
        </div>

        {/* CONNECT US BUTTON */}
        <div className="connect-us-container">
          <button className="connect-us-btn" onClick={handleOpenModal}>
            CONNECT US
          </button>
        </div>
      </section>

      {/* CONNECT US MODAL */}
      {isConnectModalOpen && (
        <div className="connect-modal-overlay" onClick={handleCloseModal}>
          <div className="connect-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="connect-modal-close-btn" onClick={handleCloseModal}>
              ×
            </button>

            <h2 className="connect-modal-heading">Connect With Us</h2>
            <p className="connect-modal-subtitle">Get a quote for additional services</p>

            <form onSubmit={handleSubmit} className="connect-form">
              <div className="connect-form-row">
                <input
                  type="text"
                  name="name"
                  placeholder="FULL NAME*"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="connect-form-input"
                />
              </div>

              <div className="connect-form-row">
                <input
                  type="email"
                  name="email"
                  placeholder="EMAIL ADDRESS*"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="connect-form-input"
                />
              </div>

              <div className="connect-form-row">
                <input
                  type="tel"
                  name="mobile"
                  placeholder="MOBILE NUMBER*"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  className="connect-form-input"
                />
              </div>

              <div className="connect-form-row">
                <input
                  type="text"
                  name="companyName"
                  placeholder="COMPANY NAME"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="connect-form-input"
                />
              </div>

              <div className="connect-form-row">
                <select
                  name="selectedService"
                  value={formData.selectedService}
                  onChange={handleInputChange}
                  required
                  className="connect-form-select"
                >
                  <option value="">SELECT SERVICE*</option>
                  {serviceOptions.map((service, index) => (
                    <option key={index} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="connect-submit-btn">
                SEND REQUEST
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PackagePlans;