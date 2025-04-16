import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function CarForm() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    pricePerDay: "",
    location: "",
    description: "",
    imageUrls: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUrlsChange = (e) => {
    const input = e.target.value;
    const urls = input
      .split(",")
      .map((url) => url.trim())
      .filter((url) => {
        if (!url) return false;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });

    setFormData((prev) => ({ ...prev, imageUrls: urls }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.imageUrls.length === 0) {
        throw new Error("Please provide at least one valid image URL");
      }

      await addDoc(collection(db, "cars"), {
        ...formData,
        pricePerDay: Number(formData.pricePerDay),
        year: Number(formData.year),
        ownerId: currentUser.uid,
        approved: false,
        createdAt: new Date(),
        available: true,
      });

      toast.success("Car listed successfully! Waiting for admin approval.");
      setFormData({
        make: "",
        model: "",
        year: "",
        pricePerDay: "",
        location: "",
        description: "",
        imageUrls: [],
      });
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold mb-8 text-blue-600 text-center"
      >
        List Your Car
      </motion.h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Make */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium">Make*</label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-1000 focus:ring-2 focus:ring-blue-100 transition"
              required
            />
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium">Model*</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              required
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium">Year*</label>
            <input
              type="number"
              name="year"
              min="1990"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium">
              Price/Day ($)*
            </label>
            <input
              type="number"
              name="pricePerDay"
              min="1"
              value={formData.pricePerDay}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Location*</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Image URLs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium">
              Image URLs* (comma separated)
            </label>
            <input
              type="text"
              value={formData.imageUrls.join(", ")}
              onChange={handleImageUrlsChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="https://i.ibb.co/abc123/car1.jpg, https://i.ibb.co/def456/car2.jpg"
              required
            />
            <p className="text-sm text-gray-500">
              Upload images to{" "}
              <a
                href="https://imgbb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ImgBB
              </a>{" "}
              and paste the direct URLs here
            </p>
          </div>

          {formData.imageUrls.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <h4 className="text-gray-700 font-medium">Image Previews</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.imageUrls.map((url, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="relative group"
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-40 w-full object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=Image+Error";
                        e.target.className =
                          "h-40 w-full object-contain p-4 bg-gray-100 rounded-lg border-2 border-gray-200";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          imageUrls: prev.imageUrls.filter(
                            (_, i) => i !== index
                          ),
                        }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="pt-4">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-colors ${
              loading
                ? "bg-blue-400"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "List My Car"
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
