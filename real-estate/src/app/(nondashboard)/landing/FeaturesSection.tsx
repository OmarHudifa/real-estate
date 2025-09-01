"use client"

import React from 'react'
import {motion} from 'framer-motion'
import FeatureCard from '@/components/FeatureCard'

const containerVariants={
hidden:{opacity:0,y:50},
visible:{opacity:1,y:0,transition:{duration:0.5,staggerChildren:0.2}}
}

const itemVariants={
  hidden:{opacity:0,y:20},
visible:{opacity:1,y:0}
}

const FeaturesSection = () => {
  return (
   <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={containerVariants} className='py-24 px-6 sm:px-8 lg:px-8 xl:px-16 bg-white'>
      <div className='max-w-4xl xl:max-w-6xl mx-auto'>
        <motion.h2 variants={itemVariants} className='text-3xl font-bold text-center mb-12 sm:w-2/3 mx-auto'>
          Quickly find the home you want using our effective search filters!
        </motion.h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16'>
          {[0,1,2].map((index)=>(
            <motion.div key={index} variants={itemVariants}>
              <FeatureCard imageSrc={`/landing-search${3-index}.png`} 
              title={["Trust worthy and Verified Listings",
              "Browse Rental Listings with Ease",
              "Simplify Your Rental Search with Advanced"][index]} 
              description={["Discover the best rental options with user reviews and ratings.",
              "Get access to use reviews and ratings for a better understanding of rental options.",
              "Find trustworthy and verified rental listings to ensure a hassle-free experience."][index]}
              linkHref={["/explore","/search","/discover"][index]}
              linkText={["Explore","Search","Discover"][index]}/>
            </motion.div>
          ))}
        </div>
      </div>
   </motion.div>
  )
}

export default FeaturesSection