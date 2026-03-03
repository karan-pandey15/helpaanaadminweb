"use client";

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/app/lib/api';
import { 
  Dumbbell, 
  MapPin, 
  Trash2, 
  Edit, 
  Search, 
  Clock,
  Star,
  X,
  Upload,
  Phone,
  Building
} from 'lucide-react';

export default function ViewGyms() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGym, setEditingGym] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/gym/all');
      if (response.data.ok) {
        setGyms(response.data.gyms);
      }
    } catch (error) {
      toast.error('Failed to fetch gyms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gym?')) return;
    
    try {
      const response = await api.delete(`/api/gym/partner/delete/${id}`);
      if (response.data.ok) {
        toast.success('Gym deleted successfully');
        setGyms(prev => prev.filter(g => g._id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete gym');
    }
  };

  const openEditModal = (gym) => {
    setEditingGym({
      ...gym,
      // Ensure workingHours and address exist
      workingHours: gym.workingHours || { from: '', to: '' },
      address: gym.address || { houseNo: '', street: '', landmark: '', city: '', state: '', pincode: '' }
    });
    setNewImages([]);
    setNewImagePreviews([]);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      // The backend updateGym uses req.body directly
      // If we want to support image upload in edit, we might need FormData if backend supports it.
      // Looking at the controller, it uses req.body:
      // const updatedGym = await Gym.findByIdAndUpdate(id, req.body, { new: true });
      
      // If we use FormData, we need to handle it on backend. 
      // Assuming we send JSON as per the payload example for create, but update usually matches.
      
      const payload = {
        name: editingGym.name,
        description: editingGym.description,
        monthlyPrice: editingGym.monthlyPrice,
        gymNumber: editingGym.gymNumber,
        partnerPhone: editingGym.partnerPhone,
        workingHours: editingGym.workingHours,
        address: editingGym.address,
        isActive: editingGym.isActive
      };

      const response = await api.put(`/api/gym/partner/update/${editingGym._id}`, payload);

      if (response.data.ok) {
        toast.success('Gym updated successfully');
        setEditModalOpen(false);
        fetchGyms();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredGyms = gyms.filter(gym => {
    const matchesSearch = gym.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (gym.address?.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gym.gymNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gym Memberships</h1>
            <p className="text-slate-500 text-sm">Manage and view all registered gyms</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search gyms, city or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredGyms.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Dumbbell size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No gyms found</h3>
            <p className="text-slate-500">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGyms.map((gym) => (
              <div key={gym._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={gym.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={gym.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 text-xs font-bold rounded-full shadow-sm">
                      {gym.gymNumber}
                    </span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm uppercase ${
                      gym.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {gym.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 text-lg truncate flex-1">{gym.name}</h3>
                    <div className="text-indigo-600 font-bold">
                      ₹{gym.monthlyPrice}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{gym.address?.city}, {gym.address?.state}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <Clock size={14} className="flex-shrink-0" />
                    <span>{gym.workingHours?.from} - {gym.workingHours?.to}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Phone size={12} />
                      <span>{gym.partnerPhone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => openEditModal(gym)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(gym._id)}
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
              <h2 className="text-xl font-bold text-slate-900">Edit Gym</h2>
              <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Gym Name</label>
                  <input
                    type="text"
                    required
                    value={editingGym.name}
                    onChange={(e) => setEditingGym({...editingGym, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Gym Number</label>
                  <input
                    type="text"
                    required
                    value={editingGym.gymNumber}
                    onChange={(e) => setEditingGym({...editingGym, gymNumber: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Monthly Price</label>
                  <input
                    type="number"
                    required
                    value={editingGym.monthlyPrice}
                    onChange={(e) => setEditingGym({...editingGym, monthlyPrice: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Partner Phone</label>
                  <input
                    type="tel"
                    required
                    value={editingGym.partnerPhone}
                    onChange={(e) => setEditingGym({...editingGym, partnerPhone: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Working Hours From</label>
                  <input
                    type="text"
                    value={editingGym.workingHours.from}
                    onChange={(e) => setEditingGym({...editingGym, workingHours: {...editingGym.workingHours, from: e.target.value}})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Working Hours To</label>
                  <input
                    type="text"
                    value={editingGym.workingHours.to}
                    onChange={(e) => setEditingGym({...editingGym, workingHours: {...editingGym.workingHours, to: e.target.value}})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select
                    value={editingGym.isActive}
                    onChange={(e) => setEditingGym({...editingGym, isActive: e.target.value === 'true'})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">City</label>
                  <input
                    type="text"
                    value={editingGym.address.city}
                    onChange={(e) => setEditingGym({...editingGym, address: {...editingGym.address, city: e.target.value}})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">State</label>
                  <input
                    type="text"
                    value={editingGym.address.state}
                    onChange={(e) => setEditingGym({...editingGym, address: {...editingGym.address, state: e.target.value}})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Pincode</label>
                  <input
                    type="text"
                    value={editingGym.address.pincode}
                    onChange={(e) => setEditingGym({...editingGym, address: {...editingGym.address, pincode: e.target.value}})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={editingGym.description}
                  onChange={(e) => setEditingGym({...editingGym, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
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
