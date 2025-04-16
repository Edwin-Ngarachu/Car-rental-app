import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("renter");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signup(email, password, role);
      toast.success(
        role === "owner"
          ? "Owner account created! Pending approval."
          : "Account created successfully!"
      );
    } catch (error) {
      const errorMessages = {
        "auth/email-already-in-use": "Email already registered",
        "auth/invalid-email": "Invalid email format",
        "auth/weak-password": "Password must be 6+ characters",
      };

      toast.error(errorMessages[error.code] || "Signup failed", {
        position: "top-center",
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <motion.div
          variants={item}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8 px-8 text-center"
        >
          <motion.h2
            className="text-3xl font-bold text-white"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            Create Account
          </motion.h2>
          <motion.p
            className="text-blue-100 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Join our car rental community
          </motion.p>
        </motion.div>

        <motion.div variants={container} className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={item}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300"
                placeholder="you@example.com"
                required
                whileFocus={{
                  scale: 1.01,
                  boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                }}
              />
            </motion.div>

            <motion.div variants={item}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password (min 6 characters)
              </label>
              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300"
                placeholder="••••••••"
                minLength="6"
                required
                whileFocus={{
                  scale: 1.01,
                  boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                }}
              />
            </motion.div>

            <motion.div variants={item} className="pt-2">
              <label className="block text-gray-700 text-sm font-medium mb-3">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() => setRole("renter")}
                    className={`w-full py-3 px-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                      role === "renter"
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-600 hover:border-blue-300"
                    }`}
                  >
                    Rent Cars
                  </button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() => setRole("owner")}
                    className={`w-full py-3 px-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                      role === "owner"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                        : "border-gray-200 text-gray-600 hover:border-indigo-300"
                    }`}
                  >
                    List My Car
                  </button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={item}>
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-4 rounded-xl text-white font-semibold shadow-lg ${
                  loading
                    ? "bg-blue-400"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                } transition-all duration-500`}
                whileHover={!loading ? { scale: 1.03 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block"
                  >
                    🔄
                  </motion.span>
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.div variants={item} className="pt-4 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4 hover:no-underline"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log in here
                </motion.span>
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
