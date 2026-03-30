import React from 'react';

const OfficialChannelNotice = () => {
  return (
    <section className="bg-red-50 py-8 border-y border-red-200">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-6 bg-white rounded-2xl shadow-sm border border-red-100">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0 bg-red-100 p-3 rounded-full mt-1">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-1">
                Pemberitahuan Penting!
              </h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Website <strong className="text-red-700">atekateknik.com</strong> (menggunakan huruf 'k') <strong>BUKAN channel resmi kami</strong>.
                Segala informasi dan transaksi di luar channel resmi, bukan merupakan tanggung jawab kami.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto">
            <a
              href="/"
              className="inline-block w-full text-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors duration-300 shadow-sm"
            >
              Semua Channel Resmi Kami
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfficialChannelNotice;
