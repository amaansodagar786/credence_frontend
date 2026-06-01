import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./BlogList.scss";

// ALL BLOG DATA DIRECTLY HERE (NO SEPARATE FILE)
const allBlogs = [
  {
    id: 1,
    title: 'An "Impossible" Positive Decision',
    date: "May 24, 2026",
    time: "9:32 am",
    category: "Finnish Immigration Service",
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=500&fit=crop",
    description: "Some cases arrive early enough to be shaped calmly. Others arrive when almost every ordinary option has already disappeared. This was one of those last-minute cases.",
    content: [
      {
        type: "paragraph",
        text: "Some cases arrive early enough to be shaped calmly. Others arrive when almost every ordinary option has already disappeared. This was one of those last-minute cases.",
        underline: "This was one of those last-minute cases.",
      },
      {
        type: "paragraph",
        text: "Our client came to our office together with their employer, who cared enough to sit beside them during the consultation session. That detail matters. It showed from the beginning that this was not a case where the employment was unclear, artificial, or weak. There was a real employer, a real need for the employee, and a real willingness to support the process.",
        underline: "this was not a case where the employment was unclear, artificial, or weak.",
      },
      {
        type: "paragraph",
        text: "The problem was timing.",
      },
      {
        type: "paragraph",
        text: "Our client had already received a negative decision from the Finnish Immigration Service. The matter had gone to the Administrative Court, and the Administrative Court had also issued a negative decision. At that stage, the time window becomes extremely narrow. Many ordinary processes before the Finnish Immigration Service take longer than the time a person has left after receiving a negative court decision.",
        underline: "At that stage, the time window becomes extremely narrow.",
      },
      {
        type: "paragraph",
        text: "In the previous decision, the Finnish Immigration Service had refused the application and ordered removal from Finland. The case had been assessed under the previous ground, and that path had reached its limit. Continuing in the same direction would not have been realistic. A different legal route had to be found, and it had to be found immediately.",
        underline: "Continuing in the same direction would not have been realistic.",
      },
      {
        type: "paragraph",
        text: "The only realistic option was a residence permit application as a specialist.",
      },
      {
        type: "paragraph",
        text: "That meant rebuilding the case under a new ground, preparing the application properly, and proving that the client genuinely qualified — not just on paper, but in practice. The employer's role was central. Without clear documentation of the employment relationship and the specialist nature of the work, the application would not have stood. We worked through it carefully, quickly, and with full attention to what the Finnish Immigration Service would need to see.",
      },
      {
        type: "paragraph",
        text: "The decision came back positive. That is not a small thing in a case like this. After two negative decisions, a positive outcome required more than just filing — it required a completely different approach, a clear legal argument, and precise documentation.",
      },
      {
        type: "paragraph",
        text: "If you are facing a situation where ordinary options seem to have run out, it is worth speaking with someone who understands how to look for the options that remain. Sometimes those options exist — but they require a different kind of thinking to find.",
      },
    ],
  },
  {
    id: 2,
    title: "Residence Permit for Specialist: A Success Story",
    date: "May 18, 2026",
    time: "11:15 am",
    category: "Residence Permit",
    coverImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop",
    description: "A detailed account of how we secured a residence permit for a highly skilled professional from outside the EU. The process involved proving specialist expertise and employer commitment.",
    content: [
      {
        type: "paragraph",
        text: "A detailed account of how we secured a residence permit for a highly skilled professional from outside the EU. The process involved proving specialist expertise and employer commitment.",
      },
    ],
  },
  {
    id: 3,
    title: "Appeals & Administrative Court: Winning Against Odds",
    date: "May 10, 2026",
    time: "2:45 pm",
    category: "Court Appeals",
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=500&fit=crop",
    description: "How we overturned a negative decision at the Administrative Court level using fresh evidence and strategic legal arguments. A must-read for anyone facing rejection.",
    content: [
      {
        type: "paragraph",
        text: "How we overturned a negative decision at the Administrative Court level using fresh evidence and strategic legal arguments.",
      },
    ],
  },
];

const BlogList = () => {
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
          {allBlogs.map((blog) => (
            <motion.div 
              key={blog.id} 
              className="blog-card"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={`/blog/${blog.id}`} state={{ blogData: blog }} className="blog-card-link">
                <div className="blog-card-image">
                  <img src={blog.coverImage} alt={blog.title} />
                </div>
                <div className="blog-card-content">
                  <h2 className="blog-card-title">{blog.title}</h2>
                  <p className="blog-card-description">
                    {blog.description.length > 120 
                      ? `${blog.description.substring(0, 120)}...` 
                      : blog.description}
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