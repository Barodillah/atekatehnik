import React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import HeroSection from '../components/HeroSection';
import TrustBar from '../components/TrustBar';
import QuickStats from '../components/sections/QuickStats';
import OfficialChannelNotice from '../components/OfficialChannelNotice';
import ProductGrid from '../components/ProductGrid';
import EdukasiHighlight from '../components/sections/EdukasiHighlight';
import ValueProp from '../components/ValueProp';
import FaqHome from '../components/sections/FaqHome';
import ContactMe from '../components/ContactMe';
import ReviewWidget from '../components/sections/ReviewWidget';
import Portfolio from '../components/Portfolio';
import GalleryCTA from '../components/sections/GalleryCTA';

const Home = () => {
  usePageTitle(null); // Uses default title
  return (
    <>
      <HeroSection />
      <TrustBar />
      <QuickStats />
      <ProductGrid />
      <ValueProp />
      <Portfolio />
      <GalleryCTA />
      <ReviewWidget />
      <EdukasiHighlight />
      <FaqHome />
      <OfficialChannelNotice />
      <ContactMe />
    </>
  );
};

export default Home;
