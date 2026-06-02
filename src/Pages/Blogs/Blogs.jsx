import React from 'react'
import Navbar from '../Home/Navbar/Navbar'
import Footer from '../Home/Footer/Footer'
import BlogList from './Blogslist/BlogList'
import BlogsHero from './BlogsHero/BlogsHero'
import BlogIntro from './BlogIntro/BlogIntro'

const Blogs = () => {
  return (
    <>
    <Navbar/>
    <BlogsHero/>
    <BlogIntro/>
    <BlogList/>
    <Footer/>
    </>
  )
}

export default Blogs