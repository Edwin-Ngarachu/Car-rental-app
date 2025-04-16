import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CarCard({ car }) {
  
  const imageUrl = car.imageUrls?.[0] || car.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ y: -5 }}
      className="border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <Link to={`/cars/${car.id}`}>
        <div className="h-48 bg-gray-100 relative">
          <img 
            src={imageUrl}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
              e.target.className = 'w-full h-full object-contain p-4 bg-gray-50';
            }}
          />
          {!car.approved && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              Pending Approval
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg">{car.make} {car.model}</h3>
          <p className="text-gray-600">{car.year}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className="font-bold text-blue-600">${car.pricePerDay}/day</span>
            <span className="text-sm text-gray-500">{car.location}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}