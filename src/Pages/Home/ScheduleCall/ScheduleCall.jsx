import React from 'react'
import { motion } from 'framer-motion';
import "./ScheduleCall.scss";

const ScheduleCall = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const headingVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.7
      }
    }
  };

  const highlightVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 10,
        delay: 0.2
      }
    }
  };

  const underlineVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.3
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
        delay: 0.4
      }
    }
  };

  const formVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        duration: 0.7,
        delay: 0.5
      }
    }
  };

  const inputVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1 + 0.6,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const buttonVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.9,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const footerVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 1,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted");
  };

  return (
    <motion.section 
      className="schedule-call-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div 
        className="sc-container"
        variants={containerVariants}
      >
        {/* Heading */}
        <motion.h2 
          className="sc-heading"
          variants={headingVariants}
        >
          Schedule a{" "}
          <motion.span 
            className="sc-highlight"
            variants={highlightVariants}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Call
            <motion.span 
              className="sc-underline"
              variants={underlineVariants}
            ></motion.span>
          </motion.span>{" "}
          Section
        </motion.h2>

        {/* Description */}
        <motion.p 
          className="sc-description"
          variants={descriptionVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Not sure which service or plan is right for you? <br />
          Schedule a free consultation call with our experts and get clear
          guidance.
        </motion.p>

        {/* Form */}
        <motion.form 
          className="sc-form"
          variants={formVariants}
          onSubmit={handleSubmit}
        >
          <label className="sc-visually-hidden" htmlFor="fullName">
            Full Name
          </label>
          <motion.input
            id="fullName"
            type="text"
            placeholder="FULL NAME*"
            required
            variants={inputVariants}
            custom={0}
            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px #7cd64b" }}
          />

          <label className="sc-visually-hidden" htmlFor="email">
            Email
          </label>
          <motion.input
            id="email"
            type="email"
            placeholder="EMAIL*"
            required
            variants={inputVariants}
            custom={1}
            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px #7cd64b" }}
          />

          <label className="sc-visually-hidden" htmlFor="phone">
            Phone
          </label>
          <motion.input
            id="phone"
            type="tel"
            placeholder="PHONE*"
            required
            variants={inputVariants}
            custom={2}
            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px #7cd64b" }}
          />

          <motion.button 
            type="submit"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            SUBMIT
          </motion.button>
        </motion.form>

        {/* Bottom Text */}
        <motion.p 
          className="sc-footer"
          variants={footerVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <em><strong>Let's Talk About Your Business Needs!</strong></em>
        </motion.p>
      </motion.div>
    </motion.section>
  );
};

export default ScheduleCall;