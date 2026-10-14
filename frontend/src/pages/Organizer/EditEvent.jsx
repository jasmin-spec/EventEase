import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Loader } from 'lucide-react';
import API_URL from '../../config/api';


export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    totalTickets: '',
    category: '',
    coverImage: null
  });

  // Fetch Existing Data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/events/single/${id}`);

        // Format date for HTML input (YYYY-MM-DD)
        const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : '';

        setFormData({
          title: data.title,
          description: data.description,
          date: formattedDate,
          time: data.time,
          location: data.location,
          price: data.price,
          totalTickets: data.totalTickets,
          category: data.category,
          coverImage: null
        });
        setPreview(data.coverImage); // Show existing image
      } catch (err) {
        console.error(err);
        navigate('/my-events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  //Handle Text Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      setPreview(URL.createObjectURL(file)); // Show preview of new file
    }
  };

  // Submit Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    // Append all text fields
    Object.keys(formData).forEach(key => {
      if (key !== 'coverImage') {
        data.append(key, formData[key]);
      }
    });

    // Append file ONLY if a new one was selected
    if (formData.coverImage) {
      data.append('coverImage', formData.coverImage);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/events/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      navigate('/organizer-dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Image Preview Section */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Cover Image</label>
              <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 group">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span>No image selected</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold hover:scale-105 transition">
                    Change Image
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required
                  className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-black outline-none transition bg-gray-50 focus:bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}
                    className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-black outline-none bg-gray-50 focus:bg-white">
                    <option value="Events">General Event</option>
                    <option value="Plays">Theater / Play</option>
                    <option value="Sports">Sports Match</option>
                    <option value="Music">Music </option>
                    <option value="Workshop"> Workshop</option>
                    <option value="Activities">Activity </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required
                    className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-black outline-none bg-gray-50 focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                  <input type="time" name="time" value={formData.time} onChange={handleChange} required
                    className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-black outline-none bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} required
                    className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-black outline-none bg-gray-50 focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required
                    className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-black outline-none bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Total Tickets</label>
                  <input type="number" name="totalTickets" value={formData.totalTickets} onChange={handleChange} required
                    className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-black outline-none bg-gray-50 focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                  className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-black outline-none bg-gray-50 focus:bg-white resize-none" />
              </div>
            </div>

            <button type="submit"
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition flex items-center justify-center space-x-2 shadow-lg active:scale-[0.99]">
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}