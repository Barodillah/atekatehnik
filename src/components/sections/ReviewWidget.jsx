import React, { useEffect, useRef } from 'react';

const ReviewWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.src = 'https://widgets.sociablekit.com/google-reviews/widget.js';
      script.defer = true;
      script.async = true;
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <section className="bg-surface py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full relative" ref={containerRef}>
        <div className="sk-ww-google-reviews" data-embed-id="25712675"></div>
      </div>
    </section>
  );
};

export default ReviewWidget;

