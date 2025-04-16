import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import CarGrid from "../components/cars/CarGrid";
import { motion } from "framer-motion";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import Navbar from "../components/ui/Navbar";

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [makeFilter, setMakeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [availableMakes, setAvailableMakes] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const q = query(collection(db, "cars"), where("approved", "==", true));
        const snapshot = await getDocs(q);
        const carsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          make: doc.data().make,
          model: doc.data().model,
          year: doc.data().year,
          pricePerDay: doc.data().pricePerDay,
          location: doc.data().location,
          imageUrls: doc.data().imageUrls,
          approved: doc.data().approved,
          available: doc.data().available,
        }));

        setCars(carsData);
        setFilteredCars(carsData);

        const makes = [...new Set(carsData.map((car) => car.make))].filter(
          Boolean
        );
        setAvailableMakes(makes);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  useEffect(() => {
    let results = cars.filter((car) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm.trim() === "" ||
        car.make?.toLowerCase().includes(searchLower) ||
        car.model?.toLowerCase().includes(searchLower) ||
        `${car.make} ${car.model}`.toLowerCase().includes(searchLower);

      const carPrice = car.pricePerDay || 0;
      const matchesPrice =
        priceFilter === "" ||
        (priceFilter === "0-300" && carPrice <= 300) ||
        (priceFilter === "300-600" && carPrice > 300 && carPrice <= 600) ||
        (priceFilter === "600-900" && carPrice > 600 && carPrice <= 900) ||
        (priceFilter === "900-1200" && carPrice > 900 && carPrice <= 1200);

      const matchesMake =
        makeFilter === "" ||
        car.make?.toLowerCase() === makeFilter.toLowerCase();

      return matchesSearch && matchesPrice && matchesMake;
    });

    setFilteredCars(results);
  }, [searchTerm, priceFilter, makeFilter, cars]);

  const resetFilters = () => {
    setSearchTerm("");
    setPriceFilter("");
    setMakeFilter("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <div className="pt-16">
        {" "}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto px-4 py-6"
        >
          <div className="bg-white rounded-xl p-4 shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search makes or models..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiFilter className="mr-2" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-700">Filter Options</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (per day)
                    </label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Prices</option>
                      <option value="0-300">$0 - $300</option>
                      <option value="300-600">$300 - $600</option>
                      <option value="600-900">$600 - $900</option>
                      <option value="900-1200">$900 - $1,200</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Make
                    </label>
                    <select
                      value={makeFilter}
                      onChange={(e) => setMakeFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Makes</option>
                      {availableMakes.map((make) => (
                        <option key={make} value={make}>
                          {make}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(priceFilter || makeFilter || searchTerm) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Active filters:
                    </span>
                    {searchTerm && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Search: "{searchTerm}"
                      </span>
                    )}
                    {priceFilter && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Price: {priceFilter}
                      </span>
                    )}
                    {makeFilter && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Make: {makeFilter}
                      </span>
                    )}
                    <button
                      onClick={resetFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {filteredCars.length} {filteredCars.length === 1 ? "car" : "cars"}{" "}
              found
            </p>
            {filteredCars.length > 0 && (
              <p className="text-sm text-gray-500">
                Daily rates from{" "}
                <span className="font-bold text-blue-600">
                  ${Math.min(...filteredCars.map((car) => car.pricePerDay))}
                </span>
              </p>
            )}
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-blue-700">Loading cars...</p>
            </div>
          ) : filteredCars.length > 0 ? (
            <CarGrid cars={filteredCars} />
          ) : cars.length > 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
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
                No matching cars found
              </h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your filters or search term
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No cars available at the moment
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
