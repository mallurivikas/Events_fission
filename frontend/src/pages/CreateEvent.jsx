import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('capacity', formData.capacity);
      
      if (image) {
        formDataToSend.append('image', image);
      }

      await api.post('/events', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block px-4 py-1 bg-primary rounded-full mb-4">
              <span className="text-xs font-bold text-dark uppercase">New Event</span>
            </div>
            <h2 className="text-4xl font-black text-dark uppercase">Create Event</h2>
            <p className="mt-2 text-gray-600">Fill in the details to create your event</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="form-label">Event Image</label>
              <div className="mt-2">
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Click to upload event image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="form-label">
                Event Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={100}
                className="form-input"
                placeholder="e.g., Tech Summit 2024"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                maxLength={1000}
                rows={4}
                className="form-input"
                placeholder="Describe your event..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Date and Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="form-label">
                  Event Date *
                </label>
                <input
                  id="date"
                  name="date"
                  type="datetime-local"
                  required
                  min={today}
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="capacity" className="form-label">
                  Capacity *
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  required
                  min={1}
                  max={10000}
                  className="form-input"
                  placeholder="e.g., 100"
                  value={formData.capacity}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="form-label">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                className="form-input"
                placeholder="e.g., Convention Center, Downtown"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn btn-primary"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
