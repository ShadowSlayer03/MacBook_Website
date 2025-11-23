import React from 'react'
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductViewer from './components/ProductViewer';

import gsap from 'gsap';
import { ScrollTrigger, SplitText } from 'gsap/all';
import Highlights from './components/Highlights';
import Showcase from './components/Showcase';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
  return (
    <main>
        <Navbar />
        <Hero />
        <ProductViewer />
        <Showcase />
        <Highlights />
        <Footer />
    </main>
  )
}

export default App;