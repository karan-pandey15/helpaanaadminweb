"use client";

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/app/lib/api';
import { 
  Building2, 
  MapPin, 
  Trash2, 
  Edit, 
  Search, 
  Filter,
  Users,
  Star,
  MoreVertical,
  X,
  Upload
} from 'lucide-react';

export default function ViewHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/hotels');
      if (response.data.ok) {
        setHotels(response.data.hotelRooms);
      }
    } catch (error) {
      toast.error('Failed to fetch hotels');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    try {
      const response = await api.delete(`/api/admin/hotels/${id}`);
      if (response.data.ok) {
        toast.success('Property deleted successfully');
        setHotels(prev => prev.filter(h => h._id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete property');
    }
  };

  const openEditModal = (hotel) => {
    setEditingHotel({
      ...hotel,
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : hotel.amenities
    });
    setNewImages([]);
    setNewImagePreviews([]);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const data = new FormData();
      Object.keys(editingHotel).forEach(key => {
        if (key !== 'images' && key !== '_id' && key !== '__v' && key !== 'date_added') {
          data.append(key, editingHotel[key]);
        }
      });
      
      newImages.forEach(image => {
        data.append('images', image);
      });

      const response = await api.patch(`/api/admin/hotels/${editingHotel._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.ok) {
        toast.success('Property updated successfully');
        setEditModalOpen(false);
        fetchHotels();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setEditLoading(false);
    }
  };

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      setNewImages(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || hotel.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hotel Registrations</h1>
            <p className="text-slate-500 text-sm">Manage and view all registered properties</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search hotels or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
              <Filter size={18} className="text-slate-400" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent outline-none text-sm font-medium text-slate-700 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="room">Rooms</option>
                <option value="villa">Villas</option>
                <option value="farm house">Farm Houses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No properties found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <div key={hotel._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={hotel.images[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 text-xs font-bold rounded-full shadow-sm uppercase">
                      {hotel.category}
                    </span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm uppercase ${
                      hotel.status === 'available' ? 'bg-green-100 text-green-700' : 
                      hotel.status === 'booked' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {hotel.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 text-lg truncate flex-1">{hotel.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg text-sm font-bold">
                      <Star size={14} fill="currentColor" />
                      {hotel.rating || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{hotel.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-t border-slate-100">
                    <div>
                      <span className="text-2xl font-bold text-indigo-600">₹{hotel.pricePerNight}</span>
                      <span className="text-slate-400 text-xs ml-1">/ night</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => openEditModal(hotel)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(hotel._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-900">Edit Property</h2>
              <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Name</label>
                  <input
                    type="text"
                    required
                    value={editingHotel.name}
                    onChange={(e) => setEditingHotel({...editingHotel, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <select
                    value={editingHotel.category}
                    onChange={(e) => setEditingHotel({...editingHotel, category: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="room">Room</option>
                    <option value="villa">Villa</option>
                    <option value="farm house">Farm House</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Price per Night</label>
                  <input
                    type="number"
                    required
                    value={editingHotel.pricePerNight}
                    onChange={(e) => setEditingHotel({...editingHotel, pricePerNight: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Max Guests</label>
                  <input
                    type="number"
                    required
                    value={editingHotel.maxGuests}
                    onChange={(e) => setEditingHotel({...editingHotel, maxGuests: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Location</label>
                  <input
                    type="text"
                    required
                    value={editingHotel.location}
                    onChange={(e) => setEditingHotel({...editingHotel, location: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select
                    value={editingHotel.status}
                    onChange={(e) => setEditingHotel({...editingHotel, status: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Amenities</label>
                <input
                  type="text"
                  value={editingHotel.amenities}
                  onChange={(e) => setEditingHotel({...editingHotel, amenities: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={editingHotel.description}
                  onChange={(e) => setEditingHotel({...editingHotel, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 block">Add New Images</label>
                <div className="flex flex-wrap gap-3">
                  {newImagePreviews.map((preview, i) => (
                    <img key={i} src={preview} className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                  ))}
                  <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <Upload size={20} className="text-slate-400" />
                    <input type="file" multiple hidden onChange={handleNewImageUpload} />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-70 transition-all"
                >
                  {editLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
