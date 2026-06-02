import React from 'react';
import { motion } from 'framer-motion';
import './BlogIntro.scss';

const BlogIntro = () => {
  const fadeUp = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.section 
      className="blog-intro"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeIn}
    >
      <div className="blog-intro-container">
        <motion.h2 
          className="blog-intro-title"
          variants={fadeUp}
        >
          Welcome to Our Blog
        </motion.h2>
        
        <motion.div 
          className="blog-intro-content"
          variants={fadeUp}
        >
          <p className="blog-intro-text">
            Stay updated with the latest insights, legal developments, and success stories 
            from our experienced team. We share valuable knowledge about immigration laws, 
            residence permits, and business consulting to help you navigate complex processes.
          </p>
          <p className="blog-intro-text">
            Our blog features real case studies, expert opinions, and practical advice 
            to guide you through every step of your journey. Whether you're an individual 
            seeking residency or a business looking for expert consulting, our articles 
            provide the information you need.
          </p>
        </motion.div>
        
        <motion.div 
          className="blog-intro-divider"
          variants={fadeUp}
        >
          <span className="divider-line"></span>
          <span className="divider-icon">✦</span>
          <span className="divider-line"></span>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default BlogIntro;