import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./components/cars/CarDetails";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
// import NotFound from './pages/NotFound';
import ProtectedRoute from "./components/ui/ProtectedRoute";
import OwnerCarForm from "./components/cars/CarForm";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import RentCar from "./pages/RentCar";
import RentersDashboard from "./pages/RentersDashboard";
import PendingApproval from "./pages/PendingApproval";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/cars/:id" element={<CarDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/rent/:carId" element={<RentCar />} />
          <Route path="/renters-dashboard" element={<RentersDashboard />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-car"
            element={
              <ProtectedRoute requiredRole="owner">
                <OwnerCarForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
        <ToastContainer position="top-center" autoClose={5000} />
      </AuthProvider>
    </Router>
    
  );
}

export default App;
