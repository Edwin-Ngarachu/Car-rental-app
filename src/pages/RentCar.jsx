import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RentCar() {
  const { carId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const carDoc = await getDoc(doc(db, "cars", carId));
        if (carDoc.exists()) {
          setCar({ id: carDoc.id, ...carDoc.data() });
          setTotalPrice(carDoc.data().pricePerDay * days);
        } else {
          toast.error("Car not found");
          navigate("/cars");
        }
      } catch (error) {
        toast.error("Error fetching car details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [carId, navigate]);

  useEffect(() => {
    if (car) {
      setTotalPrice(car.pricePerDay * days);
    }
  }, [days, car]);

  const handleRent = async () => {
    if (!currentUser) {
      toast.error("Please login to rent a car");
      navigate("/login", { state: { from: `/rent/${carId}` } });
      return;
    }

    try {
      await updateDoc(doc(db, "cars", carId), {
        available: false,
      });

      await addDoc(collection(db, "bookings"), {
        carId,
        carMake: car.make,
        carModel: car.model,
        carImage: car.imageUrls[0],
        userId: currentUser.uid,
        userEmail: currentUser.email,
        days,
        totalPrice,
        startDate: serverTimestamp(),
        status: "active",
        createdAt: serverTimestamp(),
      });

      toast.success("Car rented successfully!");
      navigate("/renters-dashboard");
    } catch (error) {
      toast.error("Failed to complete rental");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!car) {
    return <div className="p-8 text-center">Car not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          Rent {car.make} {car.model}
        </h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={
                  car.imageUrls[0] ||
                  "https://via.placeholder.com/600x400?text=Car+Image"
                }
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/600x400?text=Image+Not+Available";
                }}
              />
            </div>
            <div className="p-8 md:w-1/2">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                  {car.make} {car.model} ({car.year})
                </h2>
                <p className="text-gray-600 mb-4">{car.location}</p>
                <div className="flex items-center mb-4">
                  <span className="text-3xl font-bold text-blue-600">
                    ${car.pricePerDay}
                  </span>
                  <span className="text-gray-500 ml-1">/ day</span>
                </div>
              </div>

              <div className="mb-8">
                <label
                  htmlFor="days"
                  className="block text-lg font-medium mb-2"
                >
                  Rental Duration (days)
                </label>
                <input
                  type="number"
                  id="days"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);

                    if (!isNaN(value)) {
                      setDays(Math.min(30, Math.max(1, value)));
                    } else {
                      setDays(1);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      setDays(1);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Daily Rate:</span>
                  <span>${car.pricePerDay}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Days:</span>
                  <span>{days}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">${totalPrice}</span>
                </div>
              </div>

              <button
                onClick={handleRent}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-lg transition-colors"
              >
                Confirm Rental
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
