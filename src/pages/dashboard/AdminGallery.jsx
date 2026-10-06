import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';

const AdminGallery = () => {
  const { addToast } = useToast();
  const { confirmDialog } = useConfirm();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  
  // Related Links Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [relatedLinks, setRelatedLinks] = useState([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [newLinkType, setNewLinkType] = useState('product');
  const [newLinkId, setNewLinkId] = useState('');
  const [newExternalUrl, setNewExternalUrl] = useState('');
  const [newExternalTitle, setNewExternalTitle] = useState('');

  // Filters
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  const [linkTypeFilter, setLinkTypeFilter] = useState('all');

  // Autocomplete states
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchQueryInput, setSearchQueryInput] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Preview Modal States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const { authFetch } = useAuth();
  const { searchQuery } = useOutletContext();

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

  useEffect(() => {
    if (!isModalOpen) return;
    const fetchOptions = async () => {
      try {
        if (newLinkType === 'product') {
          const res = await fetch('/api/products.php?limit=1000');
          const data = await res.json();
          if (data.success) {
            setSearchOptions((data.products || []).map(p => ({
              id: p.id,
              title: p.nama,
              subtitle: p.kategori,
              image: p.gambar ? p.gambar.split(',')[0].trim() : ''
            })));
          }
        } else {
          const res = await fetch('/api/posts.php?limit=1000');
          const data = await res.json();
          if (data.success) {
            let posts = data.posts || [];
            if (newLinkType === 'portfolio') {
              posts = posts.filter(p => p.category && p.category.toLowerCase() === 'industrial installations');
            } else if (newLinkType === 'news') {
              posts = posts.filter(p => !p.category || p.category.toLowerCase() !== 'industrial installations');
            }
            setSearchOptions(posts.map(p => ({
              id: p.id,
              title: p.title,
              subtitle: p.category,
              image: p.cover_image
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch options', err);
      }
    };
    fetchOptions();
  }, [isModalOpen, newLinkType]);

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
    const confirmed = await confirmDialog('Are you sure you want to delete this gallery item?', 'Delete Media', 'danger');
    if (!confirmed) return;
    
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
        addToast('Gallery item deleted', 'success');
        fetchItems();
      } else {
        addToast(data.error || 'Failed to delete', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error deleting item', 'error');
    }
  };

  const openLinksModal = (item) => {
    setSelectedGallery(item);
    setIsModalOpen(true);
    fetchRelatedLinks(item.id);
  };

  const closeLinksModal = () => {
    setIsModalOpen(false);
    setSelectedGallery(null);
    setRelatedLinks([]);
    setNewLinkType('product');
    setNewLinkId('');
    setSearchQueryInput('');
    setNewExternalUrl('');
    setNewExternalTitle('');
  };

  const fetchRelatedLinks = async (galleryId) => {
    setIsLoadingLinks(true);
    try {
      const res = await authFetch(`/api/admin_gallery_links.php?gallery_id=${galleryId}`);
      const data = await res.json();
      if (data.success) {
        setRelatedLinks(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch related links', err);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (newLinkType !== 'external' && !newLinkId) return addToast('Silakan isi ID target.', 'warning');
    if (newLinkType === 'external' && !newExternalUrl) return addToast('Silakan isi URL untuk link eksternal.', 'warning');

    const formData = new FormData();
    formData.append('action', 'add');
    formData.append('gallery_id', selectedGallery.id);
    formData.append('related_type', newLinkType);
    formData.append('related_id', newLinkId);
    formData.append('external_url', newExternalUrl);
    formData.append('external_title', newExternalTitle);

    try {
      const res = await authFetch('/api/admin_gallery_links.php', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setNewLinkId('');
        setSearchQueryInput('');
        addToast('Link berhasil ditambahkan', 'success');
        fetchRelatedLinks(selectedGallery.id);
        fetchItems(); // refresh links_count in main table
      } else {
        addToast(data.error || 'Failed to add link', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error adding link', 'error');
    }
  };

  const handleDeleteLink = async (linkId) => {
    const confirmed = await confirmDialog('Yakin ingin menghapus link ini?', 'Hapus Link', 'danger');
    if (!confirmed) return;
    
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', linkId);

    try {
      const res = await authFetch('/api/admin_gallery_links.php', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        addToast('Link berhasil dihapus', 'success');
        fetchRelatedLinks(selectedGallery.id);
        fetchItems(); // refresh links_count
      } else {
        addToast(data.error || 'Failed to delete', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Convert object of objects to array if the API didn't wrap it in a data property
  const itemsArray = Array.isArray(items) ? items : Object.values(items).filter(val => typeof val === 'object' && val !== null && 'id' in val);

  const filteredItems = itemsArray.filter(item => {
    // Media Type Filter
    if (mediaTypeFilter !== 'all' && item.type !== mediaTypeFilter) return false;

    // Link Type Filter
    if (linkTypeFilter !== 'all') {
      if (linkTypeFilter === 'no_link' && parseInt(item.links_count || 0) > 0) return false;
      if (linkTypeFilter !== 'no_link') {
        const linkTypes = item.link_types ? item.link_types.split(',') : [];
        if (!linkTypes.includes(linkTypeFilter)) return false;
      }
    }

    // Search Query Filter
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      const matchesSearch = (item.title && item.title.toLowerCase().includes(lower)) ||
                            (item.type && item.type.toLowerCase().includes(lower));
      if (!matchesSearch) return false;
    }

    return true;
  });

  const filteredOptions = searchOptions.filter(opt => 
    opt.title.toLowerCase().includes(searchQueryInput.toLowerCase()) && 
    !relatedLinks.find(r => r.related_id == opt.id && r.related_type === newLinkType)
  );

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

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{filteredItems.length}</span> items
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={mediaTypeFilter}
              onChange={(e) => setMediaTypeFilter(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none shadow-sm"
            >
              <option value="all">All Media Types</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <select
              value={linkTypeFilter}
              onChange={(e) => setLinkTypeFilter(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none shadow-sm"
            >
              <option value="all">All Link Types</option>
              <option value="no_link">No Link (0)</option>
              <option value="product">Product</option>
              <option value="portfolio">Portfolio</option>
              <option value="news">News</option>
              <option value="external">External Link</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Links</th>
                <th className="px-6 py-4">Aspect Class</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading gallery items...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    {searchQuery ? 'No gallery items match your search.' : 'No gallery items found. Click "Add New Media" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div 
                        onClick={() => {
                          setPreviewItem(item);
                          setIsPreviewOpen(true);
                        }}
                        className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative cursor-pointer hover:ring-2 hover:ring-blue-400 hover:opacity-90 transition-all"
                      >
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
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1" title="Jumlah tayangan">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span className="font-bold">{item.views || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <button 
                        onClick={() => openLinksModal(item)}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors px-2 py-1 bg-slate-50 hover:bg-blue-50 rounded border border-slate-200 hover:border-blue-200"
                        title="Kelola Link Terkait"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_link</span>
                        <span className="font-bold">{item.links_count || 0}</span>
                      </button>
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

      {/* Modal Manage Links */}
      {isModalOpen && selectedGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">add_link</span>
                Manage Related Links
              </h2>
              <button onClick={closeLinksModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-1">Gallery Item:</p>
                <p className="font-semibold text-slate-800">{selectedGallery.title}</p>
              </div>

              {/* Add New Link Form */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-8">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  Add New Link
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-4 items-end">
                  <div className="w-full sm:w-1/4 shrink-0">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Link Type</label>
                    <select 
                      value={newLinkType}
                      onChange={(e) => {
                        setNewLinkType(e.target.value);
                        setSearchQueryInput('');
                        setNewLinkId('');
                      }}
                      className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none shadow-sm"
                    >
                      <option value="product">Product</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="news">News</option>
                      <option value="external">External Link</option>
                    </select>
                  </div>

                  <div className="relative w-full sm:flex-1">
                    {newLinkType === 'external' ? (
                      <div className="flex gap-2">
                        <div className="w-1/3">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Link Title</label>
                          <input 
                            type="text" 
                            value={newExternalTitle} 
                            onChange={(e) => setNewExternalTitle(e.target.value)} 
                            className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none shadow-sm"
                            placeholder="e.g. Tokopedia"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">URL</label>
                          <input 
                            type="text" 
                            value={newExternalUrl} 
                            onChange={(e) => setNewExternalUrl(e.target.value)} 
                            className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none shadow-sm"
                            placeholder="https://"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Search Target</label>
                        <div className="flex items-center bg-white border border-slate-300 rounded-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors shadow-sm overflow-hidden">
                          <span className="material-symbols-outlined text-slate-400 px-3">search</span>
                          <input
                        type="text"
                        value={searchQueryInput}
                        onChange={(e) => { 
                          setSearchQueryInput(e.target.value); 
                          setShowSearchDropdown(true); 
                          setNewLinkId(''); // reset if they type something new
                        }}
                        onFocus={() => setShowSearchDropdown(true)}
                        className="w-full py-2.5 px-2 outline-none text-sm bg-transparent"
                        placeholder={`Search ${newLinkType} to link...`}
                      />
                    </div>
                    
                    {/* Dropdown */}
                    {showSearchDropdown && searchQueryInput && filteredOptions.length > 0 && (
                      <div className="absolute z-20 w-full bg-white border border-slate-200 shadow-lg rounded-md mt-1 max-h-48 overflow-y-auto">
                        {filteredOptions.map((opt) => (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => {
                              setNewLinkId(opt.id);
                              setSearchQueryInput(opt.title);
                              setShowSearchDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-none cursor-pointer"
                          >
                            {opt.image ? (
                              <img src={opt.image} alt={opt.title} className="w-8 h-8 object-cover rounded bg-slate-100" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400 text-sm">image</span>
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-bold text-slate-700 block line-clamp-1">{opt.title}</span>
                              <span className="text-[10px] text-slate-500">{opt.subtitle || opt.id}</span>
                            </div>
                            {newLinkId === opt.id ? (
                              <span className="material-symbols-outlined text-emerald-500 ml-auto text-lg">check_circle</span>
                            ) : (
                              <span className="material-symbols-outlined text-blue-500 ml-auto text-lg">add_circle</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {showSearchDropdown && searchQueryInput && filteredOptions.length === 0 && (
                      <div className="absolute z-20 w-full bg-white border border-slate-200 shadow-lg rounded-md mt-1 p-4 text-center text-sm text-slate-500">
                        No matching {newLinkType} found or already linked.
                      </div>
                    )}
                    </>
                  )}
                  </div>
                </div>

                <form onSubmit={handleAddLink} className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={newLinkType === 'external' ? !newExternalUrl : !newLinkId}
                    className={`font-bold py-2.5 px-6 rounded-md shadow-sm transition-colors uppercase tracking-wider text-sm flex items-center justify-center gap-2 whitespace-nowrap ${
                      (newLinkType === 'external' ? newExternalUrl : newLinkId) 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Save Link
                  </button>
                </form>
              </div>

              {/* List of Links */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Current Links</h3>
                {isLoadingLinks ? (
                  <div className="text-center py-8 text-slate-500 text-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Loading links...
                  </div>
                ) : relatedLinks.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200 border-dashed text-slate-500 text-sm">
                    No related links found. Add one above.
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                        <tr>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Target ID/Title</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {relatedLinks.map(link => (
                          <tr key={link.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                link.related_type === 'product' ? 'bg-orange-100 text-orange-700' :
                                link.related_type === 'portfolio' ? 'bg-blue-100 text-blue-700' :
                                link.related_type === 'external' ? 'bg-purple-100 text-purple-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {link.related_type}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {link.related_type === 'external' ? (
                                <>
                                  <a href={link.external_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{link.external_url}</a>
                                  {link.target_title && <span className="block text-xs text-slate-400 font-normal mt-0.5">{link.target_title}</span>}
                                </>
                              ) : (
                                <>
                                  ID: {link.related_id}
                                  {link.target_title && <span className="block text-xs text-slate-400 font-normal mt-0.5">{link.target_title}</span>}
                                </>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => handleDeleteLink(link.id)}
                                className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors inline-flex"
                                title="Remove Link"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && previewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col animate-fade-in">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-lg line-clamp-1 pr-4">{previewItem.title}</h3>
              <button 
                onClick={() => {
                  setIsPreviewOpen(false);
                  setPreviewItem(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors"
                title="Close preview"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto flex items-center justify-center bg-slate-100/50 relative">
              {previewItem.type === 'video' ? (
                <video 
                  src={previewItem.src} 
                  controls 
                  autoPlay
                  muted 
                  playsInline 
                  webkit-playsinline="true"
                  className="max-h-[70vh] rounded shadow-lg max-w-full object-contain"
                />
              ) : (
                <img 
                  src={previewItem.src} 
                  alt={previewItem.title} 
                  className="max-h-[70vh] rounded shadow-lg max-w-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
