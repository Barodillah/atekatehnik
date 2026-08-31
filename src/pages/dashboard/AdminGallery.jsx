import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const { authFetch } = useAuth();

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin_gallery.php');
      const data = await res.json();
      if (data.success) {
        setItems(data.data); // jsonSuccess uses data key if we just pass array? Wait, jsonSuccess in helpers.php wraps in `success: true` and merges array, but if we pass indexed array, it becomes data. Actually `jsonSuccess($stmt->fetchAll())` returns `{success: true, 0: {...}, 1: {...}}`. I should just map over the object keys, or I'll fix the API to return `['data' => $stmt->fetchAll()]`. Oh wait, I didn't wrap it in the API. 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, src) => {
    navigator.clipboard.writeText(src);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return;
    
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);

    try {
      const res = await authFetch('/api/admin_gallery.php', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fetchItems();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting item');
    }
  };

  // Convert object of objects to array if the API didn't wrap it in a data property
  const itemsArray = Array.isArray(items) ? items : Object.values(items).filter(val => typeof val === 'object' && val !== null && 'id' in val);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950">Gallery Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage images and videos in the public gallery.</p>
        </div>
        <Link 
          to="/admin/gallery/new" 
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-sm font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add New Media
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Aspect Class</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading gallery items...</td>
                </tr>
              ) : itemsArray.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">No gallery items found. Click "Add New Media" to create one.</td>
                </tr>
              ) : (
                itemsArray.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative">
                        {item.type === 'video' ? (
                          <>
                            <video src={item.src} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-xl">play_circle</span>
                            </div>
                          </>
                        ) : (
                          <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{item.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.height_class}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleCopy(item.id, item.src)}
                        className={`p-2 rounded transition-colors inline-flex ${
                          copiedId === item.id
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title="Copy Link"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {copiedId === item.id ? 'check' : 'content_copy'}
                        </span>
                      </button>
                      <Link 
                        to={`/admin/gallery/edit/${item.id}`}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-flex"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </Link>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors inline-flex"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
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

export default AdminGallery;
