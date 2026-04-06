import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatAdminDate } from '../../utils/dateUtils';

const Posts = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const categoryStyles = {
    'Industrial Installations': 'bg-primary-container/10 text-primary',
    'Product News': 'bg-primary-container/10 text-primary',
    'Maintenance Tips': 'bg-secondary-container/20 text-secondary',
    'Company Update': 'bg-secondary-container/20 text-secondary',
  };

  const fetchPosts = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/posts.php?page=${page}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
        setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Hapus post "${title}"?`)) return;
    try {
      await authFetch(`/api/posts.php?id=${id}`, { method: 'DELETE' });
      fetchPosts(pagination.page);
    } catch {}
  };

  return (
    <div className="p-8 max-w-7xl">
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase">Content Management</span>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Article Repository</h1>
          <p className="text-on-surface-variant max-w-lg">
            Manage your industrial insights, project installations, and technical maintenance guides for the Ateka Tehnik audience.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/posts/new')}
          className="flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-sm font-bold shadow-md hover:translate-y-[-1px] cursor-pointer transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600" }}>add</span>
          <span>Create New Post</span>
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-sm border-b-2 border-primary-container shadow-sm">
          <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Total Posts</p>
          <p className="text-3xl font-extrabold text-primary">{pagination.total}</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-sm shadow-sm">
          <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Published</p>
          <p className="text-3xl font-extrabold text-primary">{posts.filter(p => p.language === 'id').length}</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-sm shadow-sm">
          <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">English (AI)</p>
          <p className="text-3xl font-extrabold text-secondary">{posts.filter(p => p.language === 'en').length}</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-sm shadow-sm">
          <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Pages</p>
          <p className="text-3xl font-extrabold text-primary">{pagination.totalPages}</p>
        </div>
      </div>

      {/* Blog List Table */}
      <div className="bg-surface-container-lowest rounded-sm shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant">
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest">Title &amp; Category</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest">Language</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-center">Engagement</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
                    <p className="text-sm text-on-surface-variant mt-2">Memuat data...</p>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block">article</span>
                    Belum ada post. Buat post pertama Anda!
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {post.cover_image ? (
                          <div className="w-12 h-12 bg-surface-container rounded-sm overflow-hidden flex-shrink-0">
                            <img alt={post.title} className="w-full h-full object-cover" src={post.cover_image} />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-surface-container rounded-sm overflow-hidden flex-shrink-0 text-center flex items-center justify-center">
                            <span className="material-symbols-outlined text-outline">image</span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-primary group-hover:text-secondary transition-colors">{post.title}</p>
                          {post.subtitle && <p className="text-xs text-on-surface-variant truncate max-w-[300px]">{post.subtitle}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${post.language === 'en' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-700'}`}>
                        {post.language === 'en' ? 'English' : 'Indonesia'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-outline">
                      {post.publish_date ? formatAdminDate(post.publish_date) : '—'}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${categoryStyles[post.category] || 'bg-surface-container-high text-on-surface-variant'}`}>
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant" title="Views">
                          <span className="material-symbols-outlined text-[14px] text-blue-500">visibility</span>
                          <span className="font-bold">{post.view_count || 0}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant" title="Likes">
                          <span className="material-symbols-outlined text-[14px] text-red-400">favorite</span>
                          <span className="font-bold">{post.like_count || 0}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant" title="Comments">
                          <span className="material-symbols-outlined text-[14px] text-amber-500">forum</span>
                          <span className="font-bold">{post.comment_count || 0}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                          className="p-2 hover:bg-surface-container-highest rounded-sm transition-colors text-outline hover:text-primary cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-2 hover:bg-error-container/30 rounded-sm transition-colors text-outline hover:text-error cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-surface-container-low flex items-center justify-between">
          <p className="text-xs text-outline font-medium tracking-tight">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} articles)
          </p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => fetchPosts(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 bg-surface-container-highest text-primary-container rounded-sm hover:bg-white transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button 
                key={p}
                onClick={() => fetchPosts(p)}
                className={`px-3 py-1 text-xs font-bold rounded-sm ${p === pagination.page ? 'bg-primary text-white' : 'bg-surface-container-highest text-primary hover:bg-white transition-all'}`}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => fetchPosts(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 bg-surface-container-highest text-primary-container rounded-sm hover:bg-white transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual CTA */}
      <div className="mt-16 bg-primary-container p-8 rounded-sm text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-extrabold mb-2">Need to announce a new project?</h3>
          <p className="text-blue-200 text-sm max-w-md">Our documentation standards ensure every installation is featured with technical precision. Use the pre-built templates for consistency.</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <button 
            onClick={() => navigate('/admin/posts/new')}
            className="px-6 py-3 bg-secondary text-white rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-secondary-container shadow-lg cursor-pointer"
          >
            New Post
          </button>
        </div>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'wght' 200" }}>edit_note</span>
        </div>
      </div>
    </div>
  );
};

export default Posts;
