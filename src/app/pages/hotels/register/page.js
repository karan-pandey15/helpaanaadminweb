"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/app/lib/api';
import { Upload, X, Building2, MapPin, IndianRupee, Users, List, Star, Phone, Mail, FileText, Globe, CheckCircle2 } from 'lucide-react';

export default function HotelRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documents, setDocuments] = useState({
    aadhaar: null,
    pan: null,
    gst: null
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerNight: '',
    category: 'room',
    rating: '5',
    propertyArea: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    amenities: [],
    phone: '',
    email: '',
    hotelCareName: '',
    maxGuests: '2'
  });

  const amenityOptions = [
    'Free WiFi', 'Parking', 'Restaurant', 'Swimming Pool', 
    'Gym', 'Spa', 'Air Conditioning', 'Breakfast', 'Lunch', 'Dinner'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (amenity) => {
    setFormData(prev => {
      const updatedAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: updatedAmenities };
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setDocuments(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Max size is 5MB`);
        return;
      }
      setImages(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Append basic form data
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      // Append images
      images.forEach(image => {
        data.append('images', image);
      });

      // Append documents
      if (documents.aadhaar) data.append('aadhaar', documents.aadhaar);
      if (documents.pan) data.append('pan', documents.pan);
      if (documents.gst) data.append('gst', documents.gst);

      const response = await api.post('/api/admin/hotels', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.ok) {
        toast.success('Hotel registered successfully!');
        router.push('/pages/hotels/all');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Register Your Property</h1>
            <p className="text-slate-500 font-medium">Join our network and start hosting guests today</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Property Details Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                Property Details
              </h2>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Property Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. The Royal Orchid Hotel"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none"
                >
                  <option value="room">Hotel Room</option>
                  <option value="villa">Villa</option>
                  <option value="farm house">Farm House</option>
                  <option value="resort">Resort</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Property Rating</label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                >
                  {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>{num} Star</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Area (sqft)</label>
                <input
                  type="number"
                  name="propertyArea"
                  required
                  value={formData.propertyArea}
                  onChange={handleInputChange}
                  placeholder="e.g. 1500"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Price per Night (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    name="pricePerNight"
                    required
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about your property, specialties, and what makes it unique..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MapPin size={20} className="text-indigo-600" />
                Location Information
              </h2>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Complete Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street, Landmark, Area"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Globe size={16} /> Country
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-indigo-600" />
                Amenities & Facilities
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amenityOptions.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-indigo-50 transition-colors cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleCheckboxChange(amenity)}
                      className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Phone size={20} className="text-indigo-600" />
                Contact Information
              </h2>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Hotel Care Taker Name</label>
                <input
                  type="text"
                  name="hotelCareName"
                  required
                  value={formData.hotelCareName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images & Documents Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Upload size={20} className="text-indigo-600" />
                Upload Images & Documents
              </h2>
            </div>
            <div className="p-6 md:p-8 space-y-8">
              {/* Property Images */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 block">Property Images (Max 5)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group ring-2 ring-transparent hover:ring-indigo-500 transition-all">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all group">
                      <Upload size={24} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">Add Photo</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Aadhaar Card', type: 'aadhaar' },
                  { label: 'PAN Card', type: 'pan' },
                  { label: 'GST Certificate', type: 'gst' }
                ].map((doc) => (
                  <div key={doc.type} className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">{doc.label}</label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, doc.type)}
                        accept=".pdf,image/*"
                        className="hidden"
                        id={`doc-${doc.type}`}
                      />
                      <label
                        htmlFor={`doc-${doc.type}`}
                        className={`w-full flex items-center justify-between px-4 py-3 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                          documents[doc.type] 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'
                        }`}
                      >
                        <span className="text-xs font-medium truncate max-w-[120px]">
                          {documents[doc.type] ? documents[doc.type].name : `Upload ${doc.label}`}
                        </span>
                        {documents[doc.type] ? <CheckCircle2 size={18} /> : <Upload size={18} />}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-4 py-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit Registration'
              )}
            </button>
            <p className="text-sm text-slate-400">By submitting, you agree to our Terms of Service</p>
          </div>
        </form>
      </div>
    </div>
  );
}
