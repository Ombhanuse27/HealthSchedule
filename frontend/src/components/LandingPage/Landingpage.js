import React from 'react'
import Hero from '../Hero/Hero';
import Footer from '../Footer/Footer';

// NavbarLink is already rendered globally in App.js — do NOT add it here.
function Landingpage() {
  return (
    <div className="flex flex-col min-h-screen w-full p-0 m-0">
      <Hero />
      <Footer />
    </div>
  )
}

export default Landingpage;