import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const docRef = doc(db, 'cars', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const carData = docSnap.data();
          setCar(carData);
          
          const firstImage = carData.imageUrls?.[0] || carData.images?.[0] || '';
          setMainImage(firstImage);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching car:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!car) return <div className="text-center py-8">Car not found</div>;

  
  const allImages = car.imageUrls || car.images || [];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
     
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Cars
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div>
          <div className="rounded-xl overflow-hidden bg-gray-100 mb-4">
            <img
              src={mainImage || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={`${car.make} ${car.model}`}
              className="w-full h-80 md:h-96 object-contain bg-white"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                e.target.className = 'w-full h-80 md:h-96 object-contain bg-gray-100 p-8';
              }}
            />
          </div>
          
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((img, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`cursor-pointer border-2 ${mainImage === img ? 'border-blue-500' : 'border-transparent'}`}
                  onClick={() => setMainImage(img)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-20 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x75?text=Image+Error';
                      e.target.className = 'w-full h-20 object-contain bg-gray-100 p-1';
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{car.make} {car.model}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-blue-600">${car.pricePerDay}/day</span>
            {!car.approved && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                Pending Approval
              </span>
            )}
            {!car.available && car.approved && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                Currently Rented
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-gray-500">Year</h3>
              <p className="font-medium">{car.year}</p>
            </div>
            <div>
              <h3 className="text-gray-500">Location</h3>
              <p className="font-medium">{car.location}</p>
            </div>
          </div>

          <div>
            <h3 className="text-gray-500">Description</h3>
            <p className="mt-1 text-gray-700">{car.description || 'No description provided'}</p>
          </div>

          
          {car.approved && car.available ? (
            <Link
              to={`/rent/${id}`}
              className="inline-block w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium text-center"
            >
              Rent This Car
            </Link>
          ) : (
            <button 
              disabled
              className="w-full md:w-auto bg-gray-400 text-white py-3 px-6 rounded-lg font-medium cursor-not-allowed"
            >
              {car.approved ? 'Currently Unavailable' : 'Pending Approval'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}