import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';

const Portfolio = () => {
  const { t, lang } = useLanguage();
  const [industrialProjects, setIndustrialProjects] = useState([]);
  const [otherProjects, setOtherProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [indRes, othRes] = await Promise.all([
          fetch(`/api/posts.php?lang=${lang}&category=${encodeURIComponent('Industrial Installations')}&limit=3`),
          fetch(`/api/posts.php?lang=${lang}&exclude_category=${encodeURIComponent('Industrial Installations')}&limit=4`)
        ]);
        const indData = await indRes.json();
        const othData = await othRes.json();
        
        if (indData.success && othData.success) {
          setIndustrialProjects(indData.posts);
          setOtherProjects(othData.posts);
        }
      } catch (error) {
        console.error("Failed to fetch projects frontend", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [lang]);

  const renderPortfolio = (projectList) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projectList.map((project) => (
        <Link to={`/post/${project.slug}`} key={project.id} className="group bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-xl hover:border-secondary transition-all duration-500 flex flex-col text-left">
          <div className="aspect-[4/3] overflow-hidden bg-surface-container relative">
            {project.cover_image ? (
              <img
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                src={project.cover_image}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-4xl">image</span>
              </div>
            )}
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-tighter truncate max-w-[60%]">
                {project.category}
              </span>
              <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">
                {new Date(project.publish_date || project.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h3 className="font-headline font-bold text-lg text-primary mb-2 line-clamp-2">{project.title}</h3>
            <p className="text-xs font-label text-on-surface-variant font-medium mb-4 line-clamp-2">
              {project.subtitle}
            </p>
            {project.location && (
              <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center gap-2 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="truncate">{project.location}</span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );

  const renderNews = (projectList) => (
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
      {projectList.map((project) => (
        <Link to={`/post/${project.slug}`} key={project.id} className="group flex bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-md hover:border-secondary transition-all duration-300">
          <div className="w-[120px] sm:w-[180px] shrink-0 bg-surface-container overflow-hidden relative min-h-[120px] sm:min-h-[140px]">
            {project.cover_image ? (
              <img
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                src={project.cover_image}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-2xl">image</span>
              </div>
            )}
          </div>
          <div className="p-3 sm:p-5 flex flex-col flex-grow justify-center">
            <div className="flex justify-between items-center mb-2 gap-2">
              <span className="text-[10px] sm:text-xs text-on-surface-variant font-medium whitespace-nowrap">
                {new Date(project.publish_date || project.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="bg-secondary-fixed text-on-secondary-fixed text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tighter truncate max-w-[60%]">
                {project.category}
              </span>
            </div>
            <h3 className="font-headline font-bold text-sm sm:text-base text-primary mb-1 sm:mb-2 line-clamp-2 group-hover:text-secondary transition-colors leading-tight">
              {project.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-on-surface-variant font-medium line-clamp-2 mb-3">
              {project.subtitle}
            </p>
            <div className="mt-auto flex items-center gap-1.5 text-[11px] sm:text-xs text-secondary font-bold group-hover:gap-2 transition-all">
              {lang === 'id' ? 'Lihat Selengkapnya' : 'Read More'}
              <span className="material-symbols-outlined text-[14px] sm:text-base">arrow_forward</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <section className="py-20 sm:py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">

        {loading ? (
          <div className="py-20 flex justify-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : (
          <div className="space-y-20">
            {/* PORTFOLIO SECTION */}
            <div>
              <div className="max-w-3xl mb-10">
                <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-primary mb-4">
                  {lang === 'id' ? 'Pemasangan Proyek Industrial' : 'Industrial Installations Projects'}
                </h2>
                <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
                  {lang === 'id' ? 'Lebih dari 20 tahun menghadirkan rekayasa presisi dan Rice Milling Unit handal di seluruh Indonesia.' : 'Over 20 years of delivering precision engineering and reliable Rice Milling Units across Indonesia.'}
                </p>
              </div>

              {industrialProjects.length > 0 ? (
                renderPortfolio(industrialProjects.slice(0, 3))
              ) : (
                <div className="py-10 bg-surface-container-lowest rounded-sm border border-outline-variant/20 flex justify-center text-on-surface-variant">
                  {lang === 'id' ? 'Belum ada portofolio Industrial Installations.' : 'No Industrial Installations portfolio yet.'}
                </div>
              )}
            </div>

            {/* NEWS SECTION */}
            <div>
              <div className="max-w-3xl mb-10">
                <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-primary mb-4">
                  {lang === 'id' ? 'Berita & Tips Lainnya' : 'News & Other Tips'}
                </h2>
                <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
                  {lang === 'id' ? 'Berbagai tips, edukasi, berita, dan inovasi teknologi layanan purnajual kami.' : 'Various tips, education, news, and innovations in our after-sales service.'}
                </p>
              </div>

              {otherProjects.length > 0 ? (
                renderNews(otherProjects)
              ) : (
                <div className="py-10 bg-surface-container-lowest rounded-sm border border-outline-variant/20 flex justify-center text-on-surface-variant">
                  {lang === 'id' ? 'Belum ada berita lainnya.' : 'No other news yet.'}
                </div>
              )}
            </div>

            <div className="flex justify-center pt-8">
              <Link to="/portfolio" className="border-2 border-primary text-primary px-10 py-3 rounded-sm font-bold hover:bg-primary hover:text-white transition-all duration-300">
                {t('portfolio.viewMore')}
              </Link>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Portfolio;
