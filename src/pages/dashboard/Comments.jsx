import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const Comments = () => {
  const { authFetch } = useAuth();

  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, approved, spam
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ pending: 0, approved: 0, spam: 0 });

  // Fetch comments
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin_comments.php?status=${filter}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.comments);
        setStats(data.stats);
      }
    } catch (err) {
      setError('Failed to load comments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, [filter]);

  // Handle status change
  const handleStatusChange = async (commentId, newStatus) => {
    try {
      const res = await authFetch(`/api/admin_comments.php?id=${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchComments();
      } else {
        setError(data.error || 'Failed to update.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  // Handle delete
  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment permanently?')) return;
    try {
      const res = await authFetch(`/api/admin_comments.php?id=${commentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchComments();
      }
    } catch (err) {
      setError('Failed to delete.');
    }
  };

  const statusStyleMap = {
    pending:  'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    spam:     'bg-red-100 text-red-800',
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Comment Moderation</h2>
          <p className="text-on-surface-variant mt-1">Review and manage user comments on blog posts.</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => setFilter('pending')} className={`p-6 flex flex-col justify-between text-left transition-all ${filter === 'pending' ? 'bg-amber-50 ring-2 ring-amber-400' : 'bg-surface-container-low hover:bg-amber-50/50'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">pending</span>
            <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Pending Review</span>
          </div>
          <span className="text-4xl font-extrabold text-primary font-headline mt-4">{stats.pending}</span>
        </button>
        <button onClick={() => setFilter('approved')} className={`p-6 flex flex-col justify-between text-left transition-all ${filter === 'approved' ? 'bg-green-50 ring-2 ring-green-400' : 'bg-surface-container-low hover:bg-green-50/50'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500">check_circle</span>
            <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Approved</span>
          </div>
          <span className="text-4xl font-extrabold text-primary font-headline mt-4">{stats.approved}</span>
        </button>
        <button onClick={() => setFilter('spam')} className={`p-6 flex flex-col justify-between text-left transition-all ${filter === 'spam' ? 'bg-red-50 ring-2 ring-red-400' : 'bg-surface-container-low hover:bg-red-50/50'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">report</span>
            <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Spam</span>
          </div>
          <span className="text-4xl font-extrabold text-primary font-headline mt-4">{stats.spam}</span>
        </button>
      </div>

      {/* Comments List */}
      <div className="bg-surface-container-lowest shadow-sm rounded-sm overflow-hidden border border-surface-container-low">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none">User</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none">Comment</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none">Post</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Date</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
                    <p className="text-sm text-on-surface-variant mt-2">Loading comments...</p>
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">forum</span>
                    No {filter} comments found.
                  </td>
                </tr>
              ) : (
                comments.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{c.user_name}</span>
                        {c.is_anonymous == 1 && <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Anonymous</span>}
                        <span className="text-[11px] text-on-surface-variant mt-0.5">{c.ip_address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-on-surface line-clamp-2">{c.comment_text}</p>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/post/${c.post_slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium truncate block max-w-[140px]">
                        {c.post_slug}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-on-surface-variant whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${statusStyleMap[c.status] || ''}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {c.status !== 'approved' && (
                          <button onClick={() => handleStatusChange(c.id, 'approved')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-sm transition-colors" title="Approve">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </button>
                        )}
                        {c.status !== 'spam' && (
                          <button onClick={() => handleStatusChange(c.id, 'spam')} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-sm transition-colors" title="Mark as Spam">
                            <span className="material-symbols-outlined text-[20px]">report</span>
                          </button>
                        )}
                        {c.status !== 'pending' && (
                          <button onClick={() => handleStatusChange(c.id, 'pending')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-sm transition-colors" title="Move to Pending">
                            <span className="material-symbols-outlined text-[20px]">undo</span>
                          </button>
                        )}
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-sm transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Comments;
