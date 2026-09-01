import React, { useEffect, useRef } from 'react';

const ReviewWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.trustindex.io/loader.js?1eb1de880f5143708a567b2e380';
      script.defer = true;
      script.async = true;
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <section className="bg-surface py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full relative" ref={containerRef}>
        {/* Trustindex widget will load here */}
      </div>
    </section>
  );
};

export default ReviewWidget;
