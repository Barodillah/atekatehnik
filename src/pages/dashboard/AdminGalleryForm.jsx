import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ASPECT_RATIO_OPTIONS = [
  { value: 'aspect-square', label: '1:1 (Square)' },
  { value: 'aspect-video', label: '16:9 (Landscape Video/Wide)' },
  { value: 'aspect-[4/3]', label: '4:3 (Standard Landscape)' },
  { value: 'aspect-[3/4]', label: '3:4 (Portrait)' },
  { value: 'aspect-[2/3]', label: '2:3 (Tall Portrait)' },
  { value: 'aspect-[4/5]', label: '4:5 (Instagram Portrait)' },
  { value: 'aspect-[9/16]', label: '9:16 (Story/Reel/Vertical)' },
];

const AdminGalleryForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    type: 'image',
    height_class: 'aspect-square',
    src: '' // if external URL or existing
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isDragging, setIsDragging] = useState(false);

  // For Edit Mode: Fetch existing data
  useEffect(() => {
    if (isEdit) {
      const fetchItem = async () => {
        try {
          const res = await authFetch('/api/admin_gallery.php');
          const data = await res.json();
          if (data.success) {
            // Find the specific item since we don't have a GET by ID endpoint yet
            const items = Array.isArray(data.data) ? data.data : Object.values(data.data || data).filter(val => typeof val === 'object' && val !== null && 'id' in val);
            const item = items.find(i => String(i.id) === String(id));
            if (item) {
              setFormData({
                title: item.title,
                type: item.type,
                height_class: item.height_class || 'aspect-square',
                src: item.src
              });
              setPreviewUrl(item.src);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    }
  }, [id, isEdit]);

  // Handle URL change or File change -> Auto detect aspect ratio
  useEffect(() => {
    if (!previewUrl) return;

    if (formData.type === 'video') {
      // Auto-set video to 16:9 or 9:16 if possible, but let's default to aspect-video unless they change it
      // Difficult to synchronously get video dimensions without rendering, skip auto-detect for videos to keep it simple,
      // or we can just leave current class.
      return;
    }

    // It's an image, let's detect dimensions
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      if (width && height) {
        const ratio = width / height;
        let newClass = 'aspect-square';

        if (ratio > 1.5) newClass = 'aspect-video'; // ~16:9
        else if (ratio > 1.2) newClass = 'aspect-[4/3]'; // ~4:3
        else if (ratio > 0.9) newClass = 'aspect-square'; // ~1:1
        else if (ratio > 0.77) newClass = 'aspect-[4/5]'; // ~4:5
        else if (ratio > 0.69) newClass = 'aspect-[3/4]'; // ~3:4
        else if (ratio > 0.6) newClass = 'aspect-[2/3]'; // ~2:3
        else newClass = 'aspect-[9/16]'; // ~9:16

        // Only auto-update if they haven't manually touched it recently, or just overwrite (user can change after upload)
        setFormData(prev => ({ ...prev, height_class: newClass }));
      }
    };
    img.src = previewUrl;
  }, [previewUrl, formData.type]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelection(droppedFile);
    } else {
      // Check if it's a URL dropped from another tab
      const droppedUrl = e.dataTransfer.getData('URL') || e.dataTransfer.getData('text/plain');
      if (droppedUrl && (droppedUrl.startsWith('http') || droppedUrl.startsWith('data:'))) {
        setFormData(prev => ({ ...prev, src: droppedUrl }));
        setPreviewUrl(droppedUrl);
        setFile(null);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    setFile(selectedFile);
    setFormData(prev => ({ ...prev, src: '' })); // clear url if file is selected
    
    // Auto detect type based on MIME
    if (selectedFile.type.startsWith('video/')) {
      setFormData(prev => ({ ...prev, type: 'video' }));
    } else {
      setFormData(prev => ({ ...prev, type: 'image' }));
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, src: url }));
    if (url) {
      setFile(null);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !formData.src) {
      alert('Please provide a file or a URL.');
      return;
    }

    setIsSaving(true);
    const data = new FormData();
    if (isEdit) data.append('id', id);
    
    data.append('title', formData.title);
    data.append('type', formData.type);
    data.append('height_class', formData.height_class);
    
    if (file) {
      data.append('media', file);
    } else {
      data.append('src', formData.src);
    }

    try {
      const res = await authFetch('/api/admin_gallery.php', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (result.success) {
        navigate('/admin/gallery');
      } else {
        alert(result.error || 'Failed to save gallery item');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/gallery" className="text-slate-400 hover:text-blue-600 transition-colors">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950">
            {isEdit ? 'Edit Gallery Item' : 'Add New Media'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Upload a file or paste a link to display in the gallery.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form Inputs */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">Media Source</h2>
            
            {/* Drag & Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }`}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input 
                id="file-upload" 
                type="file" 
                accept="image/*,video/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">cloud_upload</span>
              <p className="text-sm font-semibold text-blue-950">Click to upload or drag & drop</p>
              <p className="text-xs text-slate-500 mt-1">Images (JPG, PNG, WEBP) or Video (MP4)</p>
              {file && (
                <div className="mt-4 inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                  Selected: {file.name}
                </div>
              )}
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="px-3 text-xs text-slate-400 font-medium uppercase">OR PASTE URL</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">External Link</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <span className="material-symbols-outlined text-sm">link</span>
                </span>
                <input 
                  type="url" 
                  value={formData.src}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/image.jpg"
                  disabled={Boolean(file)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              {file && <p className="text-[10px] text-amber-600 mt-1">Clear file selection to use URL.</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">Details</h2>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Instalasi RMU"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Media Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Aspect Ratio (Layout Size)</label>
              <p className="text-[10px] text-slate-400 mb-2">Automatically detected, but you can override it here.</p>
              <select 
                value={formData.height_class}
                onChange={(e) => setFormData({...formData, height_class: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm text-slate-700 focus:outline-none focus:border-blue-500 font-mono"
              >
                {ASPECT_RATIO_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-blue-950 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-sm shadow-md hover:bg-blue-900 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSaving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
            {isEdit ? 'Update Gallery Item' : 'Save to Gallery'}
          </button>
        </div>

        {/* Right Column: Live Preview */}
        <div className="bg-slate-100 rounded-lg border border-slate-200 p-6 flex flex-col items-center justify-start min-h-[400px]">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 w-full text-center border-b border-slate-200 pb-2">Live Preview</h2>
          
          {previewUrl ? (
            <div className="w-full max-w-sm">
              <p className="text-xs text-slate-400 text-center mb-2">This is how it will look in the masonry grid</p>
              <div className="relative group overflow-hidden rounded-xl shadow-md bg-white border border-slate-200 transition-all duration-300">
                {/* Media */}
                <div className={`relative w-full bg-slate-200 ${formData.height_class}`}>
                  {formData.type === 'video' ? (
                    <>
                      <video src={previewUrl} className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-4xl drop-shadow-md">play_circle</span>
                      </div>
                    </>
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  
                  {/* Mock Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 opacity-100">
                    <h3 className="text-white font-bold text-sm leading-tight drop-shadow-md">
                      {formData.title || 'Untitled Media'}
                    </h3>
                    <span className="text-white/80 text-[10px] mt-1 drop-shadow-md">
                      {formData.type === 'video' ? 'Video' : 'Gambar'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-50">image</span>
              <p className="text-sm">Select a file or paste a link to see preview</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminGalleryForm;
