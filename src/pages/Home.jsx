import React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import HeroSection from '../components/HeroSection';
import TrustBar from '../components/TrustBar';
import OfficialChannelNotice from '../components/OfficialChannelNotice';
import ProductGrid from '../components/ProductGrid';
import EdukasiHighlight from '../components/sections/EdukasiHighlight';
import ValueProp from '../components/ValueProp';
import FaqHome from '../components/sections/FaqHome';
import ContactMe from '../components/ContactMe';
import Portfolio from '../components/Portfolio';

const Home = () => {
  usePageTitle(null); // Uses default title
  return (
    <>
      <HeroSection />
      <TrustBar />
      <OfficialChannelNotice />
      <ProductGrid />
      <EdukasiHighlight />
      <ValueProp />
      <FaqHome />
      <ContactMe />
      <Portfolio />
    </>
  );
};

export default Home;
