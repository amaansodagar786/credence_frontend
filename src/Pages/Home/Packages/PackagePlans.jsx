import React from "react";
import "./PackagePlans.scss";

const PackagePlans = () => {
  return (
    <section className="packages">
      {/* Header */}
      <div className="packages-header">
        <h2>Package Plans</h2>
        <span className="underline" />
        <p>Monthly Fixed Pricing | VAT Excluded</p>
      </div>

      {/* Table Wrapper for scroll */}
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
              <td>Monthly Price</td>
              <td>€40</td>
              <td>€45</td>
              <td>€50</td>
              <td>€60</td>
              <td>€80</td>
            </tr>

            <tr>
              <td>Income Sources Covered</td>
              <td>1</td>
              <td>1</td>
              <td>2</td>
              <td>3</td>
              <td>1</td>
            </tr>

            <tr>
              <td>Outgoing Invoices</td>
              <td>Up to 2</td>
              <td>Up to 4</td>
              <td>Up to 4</td>
              <td>Up to 8</td>
              <td>Up to 10</td>
            </tr>

            <tr>
              <td>Expense Receipts</td>
              <td>Up to 10</td>
              <td>Up to 40</td>
              <td>Up to 40</td>
              <td>Up to 50</td>
              <td>Up to 50</td>
            </tr>

            <tr>
              <td>Support Availability</td>
              <td>Mon–Fri (9am–4pm)</td>
              <td>Mon–Fri (9am–4pm)</td>
              <td>Mon–Fri (9am–4pm)</td>
              <td>Mon–Fri (9am–4pm)</td>
              <td>Mon–Fri (9am–4pm)</td>
            </tr>

            <tr>
              <td>Invoice Generation via Email</td>
              <td className="yes">✔ Yes</td>
              <td className="yes">✔ Yes</td>
              <td className="yes">✔ Yes</td>
              <td className="yes">✔ Yes</td>
              <td className="no">✖ No</td>
            </tr>

            <tr className="action-row">
              <td></td>
              <td><button>Select Plan</button></td>
              <td><button>Select Plan</button></td>
              <td><button>Select Plan</button></td>
              <td><button>Select Plan</button></td>
              <td><button>Select Plan</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PackagePlans;
