import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const EventCard = ({ event, onRSVP, onCancelRSVP, onDelete }) => {
  const { user } = useAuth();
  const isCreator = user?._id === event.createdBy?._id;
  const hasRSVPd = event.attendees?.some((attendee) => attendee._id === user?._id);
  const isFull = event.attendeesCount >= event.capacity;
  const remainingSlots = event.capacity - event.attendeesCount;

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary to-primary-dark overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-dark opacity-50"
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
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isFull ? (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              FULL
            </span>
          ) : (
            <span className="px-3 py-1 bg-primary text-dark text-xs font-bold rounded-full">
              {remainingSlots} SLOTS LEFT
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-black text-dark mb-2 uppercase line-clamp-1">
          {event.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

        {/* Details */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-700">
            <svg
              className="w-5 h-5 mr-2 text-primary"
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
            <span className="font-semibold">{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <svg
              className="w-5 h-5 mr-2 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-semibold line-clamp-1">{event.location}</span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <svg
              className="w-5 h-5 mr-2 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="font-semibold">
              {event.attendeesCount} / {event.capacity} Attendees
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isCreator ? (
            <>
              <Link to={`/edit-event/${event._id}`} className="flex-1 btn btn-secondary text-center">
                Edit
              </Link>
              <button onClick={() => onDelete(event._id)} className="flex-1 btn btn-outline">
                Delete
              </button>
            </>
          ) : (
            <>
              {hasRSVPd ? (
                <>
                  <div className="flex-1 bg-green-100 border-2 border-green-500 text-green-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Registered
                  </div>
                  <button
                    onClick={() => onCancelRSVP(event._id)}
                    className="px-4 btn btn-outline"
                    title="Cancel RSVP"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onRSVP(event._id)}
                  disabled={isFull}
                  className="flex-1 btn btn-primary"
                >
                  {isFull ? 'Event Full' : 'RSVP Now'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
