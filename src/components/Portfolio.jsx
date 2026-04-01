import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';

const Portfolio = () => {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`/api/posts.php?lang=${lang}&limit=3`);
        const data = await res.json();
        if (data.success) {
          setProjects(data.posts);
        }
      } catch (error) {
        console.error("Failed to fetch projects frontend", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [lang]);

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
          {loading ? (
            <div className="col-span-full py-10 flex justify-center">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
            </div>
          ) : projects.map((project) => (
            <Link to={`/post/${project.slug}`} key={project.id} className="group bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-xl hover:border-secondary transition-all duration-500 flex flex-col text-left">
              <div className="aspect-[4/3] overflow-hidden bg-surface-container">
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
                    {new Date(project.publish_date || project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
