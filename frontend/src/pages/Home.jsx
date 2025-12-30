import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="section-badge">OUR SERVICES</span>
            <h1 className="section-title mt-6">
              WHAT WE DO
            </h1>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Create Events */}
            <div className="bg-primary rounded-3xl p-10 group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-dark rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-dark uppercase mb-4">
                CREATE<br />EVENTS
              </h3>
              <p className="text-dark opacity-80">
                Easily create and manage events with custom details, images, dates, and capacity limits. Share your vision and bring people together.
              </p>
            </div>

            {/* Join Events */}
            <div className="bg-dark rounded-3xl p-10 group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-primary uppercase mb-4">
                JOIN<br />EVENTS
              </h3>
              <p className="text-gray-300">
                Browse upcoming events and RSVP with one click. Real-time capacity tracking ensures you never miss out, with smart overbooking prevention.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-4xl md:text-6xl font-black text-dark uppercase mb-6">
                LET'S MAKE IT HAPPEN!
              </h2>
              <p className="text-xl text-dark mb-8 max-w-2xl mx-auto">
                Create amazing events or discover what's happening around you.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/create-event" className="btn btn-secondary text-lg px-8 py-4">
                  Create Event
                </Link>
                <Link to="/events" className="btn btn-outline text-lg px-8 py-4">
                  Browse Events
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl md:text-6xl font-black text-dark uppercase mb-6">
                READY TO GET STARTED?
              </h2>
              <p className="text-xl text-dark mb-8 max-w-2xl mx-auto">
                Join our platform to create amazing events and connect with your community.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/register" className="btn btn-secondary text-lg px-8 py-4">
                  Sign Up Now
                </Link>
                <Link to="/events" className="btn btn-outline text-lg px-8 py-4">
                  Browse Events
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
