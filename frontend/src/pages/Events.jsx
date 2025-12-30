import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import EventCard from '../components/EventCard';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/rsvp`);
      // Refresh events to show updated data
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to RSVP');
    }
  };

  const handleCancelRSVP = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}/rsvp`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="section-badge">OUR SERVICES</span>
            <h1 className="section-title mt-6 mb-8">
              UPCOMING
              <br />
              EVENTS
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover and join amazing events. RSVP now to secure your spot before they fill up.
            </p>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Events Yet</h3>
            <p className="text-gray-500 mb-6">Be the first to create an event!</p>
            <button onClick={() => navigate('/create-event')} className="btn btn-primary">
              Create Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onRSVP={handleRSVP}
                onCancelRSVP={handleCancelRSVP}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
