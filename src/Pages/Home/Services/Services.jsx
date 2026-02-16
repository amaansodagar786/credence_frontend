import React from "react";
import { motion } from "framer-motion";
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
  // Header animation variants
  const headerVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.8
      }
    }
  };

  const underlineVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  const subtitleVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.4
      }
    }
  };

  const descriptionVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.6
      }
    }
  };

  // Grid container variants - FIXED for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  // Service item variants - appearing one by one
  const itemVariants = {
    hidden: {
      y: 30,
      opacity: 0,
      scale: 0.9
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  };

  // Hover variants for service items
  const hoverVariants = {
    hover: {
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    },
    tap: {
      scale: 0.97
    }
  };

  // Number animation variants
  const numberVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 12,
        delay: 0.1
      }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <motion.section
      className="services"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Heading Section */}
      <motion.div
        className="services-header"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 variants={headerVariants}>
          Services
        </motion.h2>

        <motion.span
          className="underline"
          variants={underlineVariants}
        />

        <motion.h4 variants={subtitleVariants}>
          Complete Bookkeeping & Financial Services Under One Roof
        </motion.h4>

        <motion.p variants={descriptionVariants}>
          We offer end-to-end bookkeeping and financial support designed to meet
          your business needs.
        </motion.p>
      </motion.div>

      {/* Services Grid - Now with proper staggered animation */}
      <motion.div
        className="services-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {services.map((item, index) => (
          <motion.div
            className="service-item"
            key={item.no}
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            custom={index}
          >
            <motion.div
              className="number"
              variants={numberVariants}
            >
              {item.no}
            </motion.div>

            <div className="content">
              <h5>{item.title}</h5>
              <p>{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Services;