import React from "react";
import "./Services.scss";

const services = [
  {
    no: "01",
    title: "General Bookkeeping",
    desc: "Daily recording of income, expenses, and transactions with complete accuracy.",
  },
  {
    no: "02",
    title: "AP & AR",
    desc: "Track bills, manage vendor payments, and ensure timely customer collections.",
  },
  {
    no: "03",
    title: "Bank Reconciliation",
    desc: "Match bank statements with records to avoid errors and discrepancies.",
  },
  {
    no: "04",
    title: "Payroll Processing",
    desc: "Accurate salary calculations, payslips, and payroll compliance.",
  },
  {
    no: "05",
    title: "Financial Reporting",
    desc: "Clear monthly, quarterly, and yearly reports to understand business performance.",
  },
  {
    no: "06",
    title: "Tax Preparation",
    desc: "Organized financial data to support smooth and stress-free tax filing.",
  },
  {
    no: "07",
    title: "Financial Analysis",
    desc: "Understand profits, costs, and trends with easy-to-read insights.",
  },
  {
    no: "08",
    title: "Financial Projections",
    desc: "Plan future growth with realistic forecasts and budgets.",
  },
  {
    no: "09",
    title: "Tax Planning",
    desc: "Reduce tax burden with smart, legal planning strategies.",
  },
  {
    no: "10",
    title: "Assistance in Business Account Opening",
    desc: "Guidance and support for opening business bank accounts smoothly.",
  },
];

const Services = () => {
  return (
    <section className="services">
      {/* Heading */}
      <div className="services-header">
        <h2>Services</h2>
        <span className="underline" />
        <h4>Complete Bookkeeping & Financial Services Under One Roof</h4>
        <p>
          We offer end-to-end bookkeeping and financial support designed to meet
          your business needs.
        </p>
      </div>

      {/* List */}
      <div className="services-grid">
        {services.map((item) => (
          <div className="service-item" key={item.no}>
            <div className="number">{item.no}</div>
            <div className="content">
              <h5>{item.title}</h5>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
