import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Animation variants
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
      await login(email, password);
      toast.success("Login successful!");
    } catch (error) {
      const errorMessages = {
        "auth/invalid-email": "Invalid email format",
        "auth/user-not-found": "Email not registered",
        "auth/wrong-password": "Incorrect password",
        "auth/too-many-requests": "Too many attempts. Try later.",
        "owner-not-approved": "Owner account pending approval",
      };

      toast.error(errorMessages[error.code] || "Login failed", {
        position: "top-center",
        theme: "colored",
      });

      if (error.code === "owner-not-approved") {
        navigate("/pending-approval");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
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
            Welcome Back
          </motion.h2>
          <motion.p
            className="text-blue-100 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Sign in to your account
          </motion.p>
        </motion.div>

        {/* Form */}
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
                Password
              </label>
              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300"
                placeholder="••••••••"
                required
                minLength="6"
                whileFocus={{
                  scale: 1.01,
                  boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                }}
              />
            </motion.div>

            <motion.div
              variants={item}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <motion.input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  whileTap={{ scale: 0.9 }}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <motion.div className="text-sm" whileHover={{ scale: 1.05 }}>
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </motion.div>
            </motion.div>

            <motion.div variants={item}>
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-4 rounded-xl text-white font-semibold shadow-lg ${
                  loading
                    ? "bg-blue-400"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                }`}
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
                  "Sign In"
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.div variants={item} className="pt-4 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4 hover:no-underline"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign up here
                </motion.span>
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
