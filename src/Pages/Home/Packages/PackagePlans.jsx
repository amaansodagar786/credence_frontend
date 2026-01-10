import React from "react";
import "./PackagePlans.scss";

const PackagePlans = () => {
  return (
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
              <td className="features">Invoice Generation via Email</td>
              <td className="lite yes">✔ Yes</td>
              <td className="taxi yes">✔ Yes</td>
              <td className="premium yes">✔ Yes</td>
              <td className="pro yes">✔ Yes</td>
              <td className="restaurant no">✖ No</td>
            </tr>

            <tr className="action-row">
              <td className="features"></td>
              <td className="lite"><button>Select Plan</button></td>
              <td className="taxi"><button>Select Plan</button></td>
              <td className="premium"><button>Select Plan</button></td>
              <td className="pro"><button>Select Plan</button></td>
              <td className="restaurant"><button>Select Plan</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PackagePlans;
