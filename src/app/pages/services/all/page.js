"use client";

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/app/lib/api';
import { 
  Wrench, 
  Trash2, 
  Edit, 
  Clock, 
  Calendar, 
  Tag, 
  X, 
  Upload, 
  Search,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

export default function ViewServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/services');
      if (response.data.ok) {
        const allServices = response.data.services;
        setServices(allServices);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(allServices.map(s => s.category))];
        setCategories(uniqueCategories);
        
        // Auto-select first category if available and none selected
        if (uniqueCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(uniqueCategories[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const response = await api.delete(`/api/admin/services/${id}`);
      if (response.data.ok) {
        toast.success('Service deleted successfully');
        fetchServices();
      }
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setNewImages([]);
    setNewImagePreviews([]);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const data = new FormData();
      const fields = ['name', 'price', 'description', 'time', 'date', 'category', 'hour', 'suggestion'];
      fields.forEach(field => {
        data.append(field, editingService[field] || '');
      });
      
      newImages.forEach(image => {
        data.append('images', image);
      });

      const response = await api.patch(`/api/admin/services/${editingService._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.ok) {
        toast.success('Service updated successfully');
        setEditModalOpen(false);
        fetchServices();
      }
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Service Partners</h1>
            <p className="text-slate-500 text-sm">Manage your service providers by category</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-80 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No services found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">There are no services registered in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service._id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={service.images[0]?.url || 'https://via.placeholder.com/400x250?text=No+Service+Image'} 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => openEditModal(service)} className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(service._id)} className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{service.name}</h3>
                    <span className="text-xl font-black text-indigo-600">₹{service.price}</span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 p-2 rounded-xl">
                      <Clock size={14} className="text-indigo-400" />
                      <span>{service.hour} • {service.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 p-2 rounded-xl">
                      <Calendar size={14} className="text-indigo-400" />
                      <span>{service.date}</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <button onClick={() => openEditModal(service)} className="w-full py-3 bg-slate-50 text-slate-700 font-bold rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                    View Details
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex items-center justify-between z-10">
              <h2 className="text-xl font-black text-slate-900">Update Service</h2>
              <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Name</label>
                  <input
                    type="text"
                    required
                    value={editingService.name}
                    onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    required
                    value={editingService.category}
                    onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingService.price}
                    onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</label>
                  <input
                    type="text"
                    required
                    value={editingService.hour}
                    onChange={(e) => setEditingService({...editingService, hour: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Time</label>
                  <input
                    type="text"
                    required
                    value={editingService.time}
                    onChange={(e) => setEditingService({...editingService, time: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Days</label>
                  <input
                    type="text"
                    required
                    value={editingService.date}
                    onChange={(e) => setEditingService({...editingService, date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  value={editingService.description}
                  onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add New Images</label>
                <div className="flex flex-wrap gap-3">
                  {newImagePreviews.map((preview, i) => (
                    <img key={i} src={preview} className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm" />
                  ))}
                  <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all group">
                    <Upload size={16} className="text-slate-400 group-hover:text-indigo-500" />
                    <input type="file" multiple hidden onChange={(e) => {
                      const files = Array.from(e.target.files);
                      files.forEach(file => {
                        setNewImages(prev => [...prev, file]);
                        const reader = new FileReader();
                        reader.onloadend = () => setNewImagePreviews(prev => [...prev, reader.result]);
                        reader.readAsDataURL(file);
                      });
                    }} />
                  </label>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-8 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-70 transition-all"
                >
                  {editLoading ? 'Saving...' : 'Update Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
