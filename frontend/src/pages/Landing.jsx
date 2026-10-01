import { Box } from '@mui/material';
import About from '../components/landing/About';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';
import Navbar from '../components/shared/Navbar';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';

import { useRef } from 'react';


export default function Landing() {
  const heroRef = useRef(null);
  const comoFuncionaRef = useRef(null);
  const nosotrosRef = useRef(null);
  const faqRef = useRef(null);

  const handleNavigate = (target) => {
    const refs = {
      hero: heroRef,
      comoFunciona: comoFuncionaRef,
      nosotros: nosotrosRef,
      faq: faqRef,
    };

    const targetRef = refs[target];
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <>
      <Navbar onNavigate={handleNavigate} />

      <main>
        {/* SECCIÓN HERO */}
        <Box ref={heroRef} sx={{ scrollMarginTop: '80px' }}>
          <Hero onNavigate={handleNavigate} />
        </Box>

        {/* SECCIÓN CÓMO FUNCIONA */}
        <Box ref={comoFuncionaRef} sx={{ scrollMarginTop: '80px' }}>
          <HowItWorks />
        </Box>

        {/* SECCIÓN SOBRE NOSOTROS */}
        <Box ref={nosotrosRef} sx={{ scrollMarginTop: '80px' }}>
          <About />
        </Box>

        {/* SECCIÓN PREGUNTAS FRECUENTES */}
        <Box ref={faqRef} sx={{ scrollMarginTop: '80px' }}>
          <FAQ />
        </Box>
        <Footer />

      </main>
    </>
  );
}