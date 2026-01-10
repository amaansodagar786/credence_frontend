import React from 'react'

import Hero from './HeroSection/Hero'
import Services from './Services/Services'
import PackagePlans from './Packages/PackagePlans'
import AboutCredence from './About/AboutCredence'
import WhyChooseCredence from './WhyChooseCredence/WhyChooseCredence.JSX'
import CTASection from './CTASection/CTASection'
import Faq from './Faq/Faq'
import ScheduleCall from './ScheduleCall/ScheduleCall'
import Footer from './Footer/Footer'
import ModalProvider from './Model/ModalProvider'

const Home = () => {
  return (
    <ModalProvider> {/* Wrap everything with ModalProvider */}
      <Hero/>
      <AboutCredence/>
      <Services/>
      <WhyChooseCredence/>
      <PackagePlans/> 
      <CTASection/>
      <Faq/>
      <ScheduleCall/>
      <Footer/> 
    </ModalProvider>
  )
}

export default Home