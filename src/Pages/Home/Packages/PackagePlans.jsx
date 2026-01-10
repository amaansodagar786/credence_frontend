import React from "react";
import "./PackagePlans.scss";

const PackagePlans = () => {
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

              {/* ✅ SAME CELL: Yes/No + Button */}
              <tr>
                <td className="features invoice-cell">Invoice Generation via Email</td>

                <td className="lite invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <button>Select Plan</button>
                  </div>
                </td>

                <td className="taxi invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <button>Select Plan</button>
                  </div>
                </td>

                <td className="premium invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <button>Select Plan</button>
                  </div>
                </td>

                <td className="pro invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <button>Select Plan</button>
                  </div>
                </td>

                <td className="restaurant invoice-cell">
                  <div className="cell-content">
                    <span className="no">✖ No</span>
                    <button>Select Plan</button>
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
          {/* LEFT */}
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

          {/* DIVIDER */}
          <div className="divider"></div>

          {/* RIGHT */}
          <div className="service-col">
            <h3>Price (Excl. VAT)</h3>
            <ul>
              <li>€25</li>
              <li>€20 per salary</li>
              <li>Equivalent to <b>1 month’s accounting fee</b></li>
              <li>€150</li>
              <li>Equivalent to <b>1 month’s accounting fee</b></li>
              <li>€50 per hour</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default PackagePlans;
