import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

export default function RentersDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const bookingsMap = new Map();
        querySnapshot.docs.forEach(doc => {
          const bookingData = doc.data();
          const startDate = bookingData.startDate?.toDate();
          
          // Calculate end date if not available in database
          let endDate = bookingData.endDate?.toDate();
          if (!endDate && startDate && bookingData.days) {
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + bookingData.days);
          }

          const booking = {
            id: doc.id,
            ...bookingData,
            startDate,
            endDate // This will be either from database or calculated
          };
          
          if (!bookingsMap.has(booking.carId)) {
            bookingsMap.set(booking.carId, booking);
          } else {
            console.warn(`Duplicate booking found for car: ${booking.carId}`);
          }
        });
        
        setBookings(Array.from(bookingsMap.values()));
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchBookings();
  }, [currentUser]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Home
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
        <Link
          to="/cars"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Browse More Cars
        </Link>
      </div>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings yet</h3>
          <p className="mt-1 text-gray-500">Your upcoming trips will appear here</p>
          <Link
            to="/cars"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Browse Available Cars
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map(booking => {
            // Format dates for display
            const startDateStr = booking.startDate?.toLocaleDateString() || 'Not specified';
            const endDateStr = booking.endDate?.toLocaleDateString() || 'Not specified';
            const days = booking.days || 
              (booking.startDate && booking.endDate 
                ? Math.round((booking.endDate - booking.startDate) / (1000 * 60 * 60 * 24))
                : null);

            return (
              <div 
                key={booking.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className="h-48 bg-gray-100 relative">
                  <img
                    src={booking.carImage || 'https://via.placeholder.com/400x300?text=Car+Image'}
                    alt={`${booking.carMake} ${booking.carModel}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Car+Image';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                    {booking.status === 'active' ? 'Active' : 'Completed'}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">
                    {booking.carMake} {booking.carModel}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600">
                        {startDateStr} {days ? `(${days} day${days !== 1 ? 's' : ''})` : ''}
                        {booking.endDate && ` - ${endDateStr}`}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-600">
                        Total: <span className="font-semibold text-blue-600">${booking.totalPrice}</span>
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}