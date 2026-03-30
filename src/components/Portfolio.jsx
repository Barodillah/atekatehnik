import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Portfolio = () => {
  const { t } = useLanguage();
  const projects = [
    {
      title: "PEMBUATAN RICEMILL BERAS GLOSOR SRAGEN",
      img: "https://atekateknik.com/wp-content/uploads/2019/10/ateka-teknik-ricemill-2.jpg",
      tag: "Sragen",
      location: "Jawa Tengah"
    },
    {
      title: "PEMBUATAN RICE MILL POLES SURAKARTA",
      img: "https://atekateknik.com/wp-content/uploads/2019/10/ateka-teknik-ricemill-3.jpg",
      tag: "Surakarta",
      location: "Jawa Tengah"
    },
    {
      title: "PEMBUATAN RICE MILL PREMIUM JAWA BARAT",
      img: "https://atekateknik.com/wp-content/uploads/2020/12/Slide1-6.jpg",
      tag: "Premium",
      location: "Jawa Barat"
    },
    {
      title: "PEMBUATAN RICE MILLING UNIT RMU PAKET PENGADAAN 1",
      img: "https://atekateknik.com/wp-content/uploads/2020/12/Slide1-1.jpg",
      tag: "Paket 1",
      location: "Indonesia"
    },
    {
      title: "PEMBUATAN RICE MILLING UNIT RMU PAKET PENGADAAN 2",
      img: "https://atekateknik.com/wp-content/uploads/2020/07/Slide1.jpg",
      tag: "Paket 2",
      location: "Indonesia"
    },
    {
      title: "PEMBUATAN RICE MILLING UNIT RMU PAKET PENGADAAN 3",
      img: "https://atekateknik.com/wp-content/uploads/2020/07/Slide1-1.jpg",
      tag: "Paket 3",
      location: "Indonesia"
    }
  ];

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-headline font-extrabold text-primary">{t('portfolio.title')}</h2>
          <p className="text-on-surface-variant leading-relaxed">
            {t('portfolio.subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {projects.slice(0, 3).map((project, idx) => (
            <div key={idx} className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="aspect-video overflow-hidden">
                <img 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={project.img}
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-headline font-bold text-primary text-lg">{project.title}</h3>
                  <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider min-w-fit ml-4 mt-1">
                    {project.tag}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant text-sm border-t border-outline-variant/10 pt-3 mt-3">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {project.location}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Link to="/portfolio" className="border-2 border-primary text-primary px-10 py-3 rounded-sm font-bold hover:bg-primary hover:text-white transition-all duration-300">
            {t('portfolio.viewMore')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
