import React from 'react'

import Hero from './HeroSection/Hero'
import Services from './Services/Services'
import PackagePlans from './Packages/PackagePlans'
import AboutCredence from './About/AboutCredence'
import WhyChooseCredence from './WhyChooseCredence/WhyChooseCredence'
import CTASection from './CTASection/CTASection'
import Faq from './Faq/Faq'
import ScheduleCall from './ScheduleCall/ScheduleCall'
import Footer from './Footer/Footer'
import ModalProvider from './Model/ModalProvider'
import Testimonials from './Testimonial/Testimonials'
// import Testimonials from './Testimonial/Testimonials'

const Home = () => {
  return (
    <ModalProvider> 
      {/* <Hero/> */}
      <PackagePlans/> 
      <AboutCredence/>
      <Services/>
      <WhyChooseCredence/>
      
      <CTASection/>
      <Faq/>
      <ScheduleCall/>
      {/* <Testimonials/>    */}
      <Footer/> 
    </ModalProvider>
  )
}

export default Home