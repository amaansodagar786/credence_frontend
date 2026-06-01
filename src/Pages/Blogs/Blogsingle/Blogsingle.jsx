import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./BlogSingle.scss";
import Navbar from "../../Home/Navbar/Navbar";
import { Footer } from "antd/es/layout/layout";

// Static author (same for all blogs)
const staticAuthor = {
  name: "EMILJAN CECI",
  designation: "Founding Partner, Appeals & Cases Law Office",
  image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
  bio: "Emiljan Ceci is the Founding Partner of Appeals & Cases Law Office, specialising in immigration matters and business consulting.",
};

// Animation variants
const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 20,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const BlogSingle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const blog = location.state?.blogData;

  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});

  // If no blog data, redirect to blog list
  if (!blog) {
    navigate("/blogs");
    return null;
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", phone: "", message: "" });
      setErrors({});
    }, 400);
  };

  const renderParagraph = (item, idx) => {
    if (!item.underline) {
      return (
        <motion.p key={idx} className="bs-para" variants={fadeUp}>
          {item.text}
        </motion.p>
      );
    }

    const parts = item.text.split(item.underline);
    return (
      <motion.p key={idx} className="bs-para" variants={fadeUp}>
        {parts[0]}
        <span className="bs-underline">{item.underline}</span>
        {parts[1]}
      </motion.p>
    );
  };

  return (
    <>
    <Navbar/>
      <motion.section
        className="blog-single"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {/* AUTHOR - STATIC */}
        <motion.div className="bs-author" variants={fadeUp}>
          <div className="bs-author-img-wrap">
            <img src={staticAuthor.image} alt={staticAuthor.name} />
          </div>
          <p className="bs-author-name">{staticAuthor.name}</p>
          <p className="bs-author-bio">{staticAuthor.bio}</p>
        </motion.div>

        {/* TITLE */}
        <motion.h1 className="bs-title" variants={fadeUp}>
          {blog.title}
        </motion.h1>

        {/* META */}
        <motion.div className="bs-meta" variants={fadeUp}>
          <span className="bs-meta-date">{blog.date}</span>
          <span className="bs-meta-dot">·</span>
          <span className="bs-meta-time">{blog.time}</span>
          <span className="bs-meta-dot">·</span>
          <span className="bs-meta-cat">{blog.category}</span>
        </motion.div>

        {/* COVER IMAGE */}
        <motion.div className="bs-cover" variants={fadeIn}>
          <img src={blog.coverImage} alt="Blog cover" />
        </motion.div>

        {/* CONTENT */}
        <motion.div
          className="bs-content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {blog.content.map((item, idx) => renderParagraph(item, idx))}
        </motion.div>

        {/* CONTACT US BUTTON */}
        <motion.div
          className="bs-cta-wrap"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.button
            className="bs-cta-btn"
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            Contact Us
          </motion.button>
        </motion.div>
      </motion.section>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              className="bs-modal-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleClose}
            />
            <motion.div
              className="bs-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button className="bs-modal-close" onClick={handleClose}>✕</button>
              {!submitted ? (
                <>
                  <h3 className="bs-modal-title">Get In Touch</h3>
                  <p className="bs-modal-sub">Fill in the details below and we'll get back to you shortly.</p>
                  <div className="bs-form">
                    <div className="bs-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={errors.name ? "error" : ""}
                      />
                      {errors.name && <span className="bs-err">{errors.name}</span>}
                    </div>
                    <div className="bs-form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={errors.email ? "error" : ""}
                      />
                      {errors.email && <span className="bs-err">{errors.email}</span>}
                    </div>
                    <div className="bs-form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={errors.phone ? "error" : ""}
                      />
                      {errors.phone && <span className="bs-err">{errors.phone}</span>}
                    </div>
                    <div className="bs-form-group">
                      <label>Message</label>
                      <textarea
                        placeholder="Write your message here..."
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className={errors.message ? "error" : ""}
                      />
                      {errors.message && <span className="bs-err">{errors.message}</span>}
                    </div>
                    <motion.button
                      className="bs-modal-submit"
                      onClick={handleSubmit}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Submit
                    </motion.button>
                  </div>
                </>
              ) : (
                <motion.div className="bs-success">
                  <div className="bs-success-icon">✓</div>
                  <h3>Thank You!</h3>
                  <p>Your message has been received. We will get back to you as soon as possible.</p>
                  <motion.button className="bs-cta-btn" onClick={handleClose}>
                    Close
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Footer/>
    </>
  );
};

export default BlogSingle;