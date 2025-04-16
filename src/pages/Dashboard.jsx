import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import CarGrid from "../components/cars/CarGrid";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cars");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const carsQuery = query(
          collection(db, "cars"),
          where("ownerId", "==", currentUser.uid)
        );
        const carsSnapshot = await getDocs(carsQuery);
        const carsData = carsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCars(carsData);

        if (carsData.length > 0) {
          const bookingsQuery = query(
            collection(db, "bookings"),
            where(
              "carId",
              "in",
              carsData.map((car) => car.id)
            )
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);
          const bookingsData = bookingsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              startDate: data.startDate?.toDate(),
              endDate: data.endDate?.toDate(),
            };
          });
          setBookings(bookingsData);
          console.log("Fetched bookings:", bookingsData);
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.uid) {
      fetchData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <Link
          to="/add-car"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          + Add New Car
        </Link>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("cars")}
          className={`px-4 py-2 font-medium ${
            activeTab === "cars"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          My Cars ({cars.length})
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2 font-medium ${
            activeTab === "bookings"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Cars Booked ({bookings.length})
        </button>
      </div>

      {activeTab === "cars" ? (
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-600">Total Listings</h3>
              <p className="text-3xl font-bold">{cars.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-600">Available</h3>
              <p className="text-3xl font-bold">
                {cars.filter((car) => car.available).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-600">Booked</h3>
              <p className="text-3xl font-bold">
                {cars.filter((car) => !car.available).length}
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Your Cars</h2>
          <CarGrid cars={cars} showStatus={true} />
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center p-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No bookings found
              </h3>
              <p className="mt-1 text-gray-500">
                When your cars get booked, they'll appear here
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            src={booking.carImage}
                            alt={`${booking.carMake} ${booking.carModel}`}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/40";
                              e.target.className =
                                "h-10 w-10 rounded-full object-contain bg-gray-100 p-1";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.carMake} {booking.carModel}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.startDate?.toLocaleDateString()} ({booking.days}{" "}
                      day{booking.days !== 1 ? "s" : ""})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${booking.totalPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </motion.div>
  );
}
