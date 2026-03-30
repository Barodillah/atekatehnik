import React from 'react';
import HeroSection from '../components/HeroSection';
import TrustBar from '../components/TrustBar';
import OfficialChannelNotice from '../components/OfficialChannelNotice';
import ProductGrid from '../components/ProductGrid';
import ValueProp from '../components/ValueProp';
import ContactMe from '../components/ContactMe';
import Portfolio from '../components/Portfolio';

const Home = () => {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <OfficialChannelNotice />
      <ProductGrid />
      <ValueProp />
      <ContactMe />
      <Portfolio />
    </>
  );
};

export default Home;
