import React from 'react'
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductViewer from './components/ProductViewer';

import gsap from 'gsap';
import { ScrollTrigger, SplitText } from 'gsap/all';
import Highlights from './components/Highlights';

gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
  return (
    <main>
        <Navbar />
        <Hero />
        <ProductViewer />

        <Highlights />
    </main>
  )
}

export default App;