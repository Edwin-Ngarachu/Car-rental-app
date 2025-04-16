
import CarCard from './CarCard';

export default function CarGrid({ cars }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <CarCard key={car.id} car={{ id: car.id, ...car }} />
      ))}
    </div>
  );
}