import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./BlogList.scss";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // FETCH BLOGS FROM API
  // ============================================
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs`, {
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }

        const data = await response.json();

        if (data.success) {
          setBlogs(data.blogs);
        } else {
          throw new Error(data.message || "Failed to fetch blogs");
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // ============================================
  // EXTRACT SHORT DESCRIPTION FROM CONTENT
  // ============================================
  const getShortDescription = (content) => {
    if (!content || content.length === 0) return "No description available";

    // Get text from first content block
    const firstBlock = content[0];
    let description = "";

    if (firstBlock.text) {
      description = firstBlock.text;
    } else if (firstBlock.html) {
      // Strip HTML tags to get plain text
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = firstBlock.html;
      description = tempDiv.innerText;
    }

    // Trim to 120 characters
    if (description.length > 120) {
      return `${description.substring(0, 120)}...`;
    }

    return description;
  };

  // Loading state
  if (loading) {
    return (
      <section className="blog-list">
        <div className="blog-list-container">
          <h1 className="blog-list-title">Our Blog</h1>
          <p className="blog-list-subtitle">Insights, case studies, and legal updates</p>
          <div className="loading-state">Loading blogs...</div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="blog-list">
        <div className="blog-list-container">
          <h1 className="blog-list-title">Our Blogs</h1>
          <p className="blog-list-subtitle">Insights, case studies, and legal updates</p>
          <div className="error-state">
            <p>Failed to load blogs. Please try again later.</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // No blogs state
  if (blogs.length === 0) {
    return (
      <section className="blog-list">
        <div className="blog-list-container">
          <h1 className="blog-list-title">Our Blog</h1>
          <p className="blog-list-subtitle">Insights, case studies, and legal updates</p>
          <div className="empty-state">
            <p>No blogs available yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="blog-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="blog-list-container">
        <h1 className="blog-list-title">Our Blog</h1>
        <p className="blog-list-subtitle">Insights, case studies, and legal updates</p>

        <div className="blog-grid">
          {blogs.map((blog) => (
            <motion.div
              key={blog.blogId}
              className="blog-card"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={`/blog/${blog.blogId}`} className="blog-card-link">
                <div className="blog-card-image">
                  <img src={blog.coverImage} alt={blog.title} />
                </div>
                <div className="blog-card-content">
                  <h2 className="blog-card-title">{blog.title}</h2>
                  <p className="blog-card-description">
                    {getShortDescription(blog.content)}
                  </p>
                  <div className="blog-card-footer">
                    <span className="blog-card-date">{blog.date}</span>
                    <span className="blog-card-readmore">Read More →</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default BlogList;