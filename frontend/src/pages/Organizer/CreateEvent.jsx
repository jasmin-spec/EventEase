
// Importing required dependencies
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../config/api';

// Component Definition
export default function CreateEvent() {
  const navigate = useNavigate();

  // Get today's local date in YYYY-MM-DD format
  const dateNow = new Date();
  const today = `${dateNow.getFullYear()}-${String(
    dateNow.getMonth() + 1
  ).padStart(2, '0')}-${String(dateNow.getDate()).padStart(2, '0')}`;

  // Form data state initialization
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    availableTickets: '',
    category: 'Events',
    coverImage: null,
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Updates form fields dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handles file input with validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setFormData((prev) => ({
        ...prev,
        coverImage: null,
      }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      e.target.value = '';

      setFormData((prev) => ({
        ...prev,
        coverImage: null,
      }));

      return;
    }

    setError('');

    setFormData((prev) => ({
      ...prev,
      coverImage: file,
    }));
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccessMessage('');

    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    if (submitting) return;

    setSubmitting(true);

    try {
      const data = new FormData();

      // Add normal form fields
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('date', formData.date);
      data.append('time', formData.time);
      data.append('location', formData.location.trim());
      data.append('price', String(Number(formData.price)));
      data.append(
        'availableTickets',
        String(Number(formData.availableTickets))
      );
      data.append('category', formData.category);

      // Add image only if selected
      if (formData.coverImage) {
        data.append('coverImage', formData.coverImage);
      }

      // Send event data to API
      const response = await axios.post(
        `${API_URL}/api/events`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(
        response.data?.message || 'Event created successfully!'
      );

      setTimeout(() => {
        console.log('Event created successfully:', response.data);
        navigate('/organizer-dashboard');
      }, 1000);
    } catch (err) {
      console.error(
        'Error creating event:',
        err.response?.data || err.message
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            'Unable to create event. Please check your details.'
        );
      } else if (err.request) {
        setError(
          'No response from server. Please check your internet connection and try again.'
        );
      } else {
        setError(err.message || 'Something went wrong.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // JSX for the component UI
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-3 sm:px-5 flex justify-center items-start">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 min-w-0">

        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-6 text-center">
          Host an Event
        </h1>

        {/* Success Message */}
        {successMessage && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm sm:text-base"
          >
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm sm:text-base break-words"
          >
            {error}
          </div>
        )}

        {/* Form starts here */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Event Title Field */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Event Title
            </label>

            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full min-w-0 border-2 border-gray-200 p-3 rounded-xl focus:border-black outline-none transition"
              placeholder="e.g. Summer Music Fest"
            />
          </div>

          {/* Category Dropdown Field */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Category
            </label>

            <div className="relative">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full min-w-0 border-2 border-gray-200 p-3 pr-10 rounded-xl focus:border-black outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="Events">General Event</option>
                <option value="Plays">Theater / Play</option>
                <option value="Sports">Sports Match</option>
                <option value="Music">Music</option>
                <option value="Workshop">Workshop</option>
                <option value="Activities">Activity</option>
              </select>

              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Date and Time Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label
                htmlFor="date"
                className="block text-sm font-bold text-gray-700 mb-1"
              >
                Date
              </label>

              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                min={today}
                onChange={handleChange}
                required
                className="w-full min-w-0 border-2 border-gray-200 p-3 rounded-xl focus:border-black outline-none"
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="time"
                className="block text-sm font-bold text-gray-700 mb-1"
              >
                Time
              </label>

              <input
                id="time"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full min-w-0 border-2 border-gray-200 p-3 rounded-xl focus:border-black outline-none"
              />
            </div>
          </div>

          {/* Location Field */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Location
            </label>

            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full min-w-0 border-2 border-gray-200 p-3 rounded-xl focus:border-black outline-none"
              placeholder="City or Venue"
            />
          </div>

          {/* Price and Ticket Count Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label
                htmlFor="price"
                className="block text-sm font-bold text-gray-700 mb-1"
              >
                Price (₹)
              </label>

              <input
                id="price"
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full min-w-0 border-2 border-gray-200 p-3 rounded-xl focus:border-black outline-none"
                placeholder="0"
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="availableTickets"
                className="block text-sm font-bold text-gray-700 mb-1"
              >
                Tickets
              </label>

              <input
                id="availableTickets"
                type="number"
                name="availableTickets"
                min="1"
                step="1"
                value={formData.availableTickets}
                onChange={handleChange}
                required
                className="w-full min-w-0 border-2 border-gray-200 p-3 rounded-xl focus:border-black outline-none"
                placeholder="100"
              />
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full min-w-0 border-2 border-gray-200 p-3 rounded-xl focus:border-black outline-none resize-y"
              placeholder="Tell people what it's about..."
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label
              htmlFor="coverImage"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Cover Image
            </label>

            <input
              id="coverImage"
              type="file"
              name="coverImage"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full min-w-0 text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black text-white py-3 sm:py-4 px-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-800 transition shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Event...' : 'Create Event'}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => navigate('/organizer-dashboard')}
            className="w-full bg-gray-200 text-gray-800 py-3 sm:py-4 px-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-300 transition active:scale-95"
          >
            Cancel
          </button>

        </form>
      </div>
    </div>
  );
}
