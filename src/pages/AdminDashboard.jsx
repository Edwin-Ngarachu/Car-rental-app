import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subTab, setSubTab] = useState('cars');
  const [stats, setStats] = useState({
    totalOwners: 0,
    pendingOwners: 0,
    totalRenters: 0,
    pendingCars: 0,
    totalCars: 0,
    totalBookings: 0,
    pendingApprovals: 0
  });
  const [owners, setOwners] = useState([]);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [renters, setRenters] = useState([]);
  const [pendingCars, setPendingCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
          ownersQuery,
          pendingOwnersQuery,
          rentersQuery,
          pendingCarsQuery,
          approvedCarsQuery,
          bookingsQuery
        ] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('role', '==', 'owner'), where('approved', '==', true))),
          getDocs(query(collection(db, 'users'), where('role', '==', 'owner'), where('approved', '==', false))),
          getDocs(query(collection(db, 'users'), where('role', '==', 'renter'))),
          getDocs(query(collection(db, 'cars'), where('approved', '==', false))),
          getDocs(query(collection(db, 'cars'), where('approved', '==', true))),
          getDocs(collection(db, 'bookings'))
        ]);

        const ownersData = ownersQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
          cars: []
        }));

        const pendingOwnersData = pendingOwnersQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
        }));

        const rentersData = rentersQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
        }));

        const pendingCarsData = pendingCarsQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
        }));

        const approvedCarsData = approvedCarsQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
        }));

        
        approvedCarsData.forEach(car => {
          const owner = ownersData.find(o => o.id === car.ownerId);
          if (owner) owner.cars.push(car);
        });

        setOwners(ownersData);
        setPendingOwners(pendingOwnersData);
        setRenters(rentersData);
        setPendingCars(pendingCarsData);
        
        setStats({
          totalOwners: ownersData.length,
          pendingOwners: pendingOwnersData.length,
          totalRenters: rentersData.length,
          pendingCars: pendingCarsData.length,
          totalCars: approvedCarsData.length,
          totalBookings: bookingsQuery.size,
          pendingApprovals: pendingOwnersData.length + pendingCarsData.length
        });

      } catch (err) {
        toast.error('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleApproveOwner = async (ownerId) => {
    try {
      await updateDoc(doc(db, 'users', ownerId), {
        approved: true,
        approvedAt: new Date()
      });
      
      const approvedOwner = pendingOwners.find(owner => owner.id === ownerId);
      if (approvedOwner) {
        setOwners(prev => [...prev, { ...approvedOwner, approved: true }]);
      }
      
      setPendingOwners(prev => prev.filter(owner => owner.id !== ownerId));
      setStats(prev => ({
        ...prev,
        pendingOwners: prev.pendingOwners - 1,
        totalOwners: prev.totalOwners + 1,
        pendingApprovals: prev.pendingApprovals - 1
      }));
      toast.success('Owner approved!');
    } catch (err) {
      toast.error('Approval failed');
      console.error(err);
    }
  };

  const handleApproveCar = async (carId) => {
    try {
      const carToApprove = pendingCars.find(car => car.id === carId);
      await updateDoc(doc(db, 'cars', carId), {
        approved: true,
        approvedAt: new Date()
      });

     
      if (carToApprove?.ownerId) {
        setOwners(prev => prev.map(owner => 
          owner.id === carToApprove.ownerId
            ? { ...owner, cars: [...owner.cars, { ...carToApprove, id: carId, approved: true }] }
            : owner
        ));
      }

      setPendingCars(prev => prev.filter(car => car.id !== carId));
      setStats(prev => ({
        ...prev,
        pendingCars: prev.pendingCars - 1,
        totalCars: prev.totalCars + 1,
        pendingApprovals: prev.pendingApprovals - 1
      }));
      toast.success('Car approved!');
    } catch (err) {
      toast.error('Approval failed');
      console.error(err);
    }
  };

  const handleRejectCar = async (carId) => {
    try {
      await updateDoc(doc(db, 'cars', carId), {
        rejected: true,
        rejectedAt: new Date()
      });
      setPendingCars(prev => prev.filter(car => car.id !== carId));
      setStats(prev => ({
        ...prev,
        pendingCars: prev.pendingCars - 1,
        pendingApprovals: prev.pendingApprovals - 1
      }));
      toast.success('Car rejected!');
    } catch (err) {
      toast.error('Rejection failed');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
      console.error(err);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    try {
      if (typeof date === 'string') return date;
      if (date.toDate) date = date.toDate();
      if (date instanceof Date) return date.toLocaleDateString();
      return 'Invalid date';
    } catch {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-blue-800 text-white p-4">
        <div className="flex items-center space-x-2 p-4 border-b border-blue-700">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h1 className="text-xl font-bold">Rental Admin</h1>
        </div>
        <nav className="mt-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center w-full p-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('owners')}
            className={`flex items-center w-full p-3 rounded-lg mt-2 ${activeTab === 'owners' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Car Owners
          </button>
          <button
            onClick={() => setActiveTab('renters')}
            className={`flex items-center w-full p-3 rounded-lg mt-2 ${activeTab === 'renters' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Renters
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center w-full p-3 rounded-lg mt-2 ${activeTab === 'approvals' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Approvals
            {stats.pendingApprovals > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.pendingApprovals}
              </span>
            )}
          </button>
        </nav>
      </div>

      
      <div className="ml-64 p-8">
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'owners' && 'Car Owners'}
            {activeTab === 'renters' && 'Renters'}
            {activeTab === 'approvals' && 'Pending Approvals'}
          </h2>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

       
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500">Car Owners</h3>
                  <p className="text-2xl font-bold">{stats.totalOwners}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500">Renters</h3>
                  <p className="text-2xl font-bold">{stats.totalRenters}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500">Pending Approvals</h3>
                  <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500">Total Cars</h3>
                  <p className="text-2xl font-bold">{stats.totalCars}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        
        {activeTab === 'owners' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cars Listed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {owners.map(owner => (
                    <tr key={owner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {owner.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {owner.name || 'No name'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {owner.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {owner.cars?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {owner.approved ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        
        {activeTab === 'renters' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renters.map(renter => (
                    <tr key={renter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-medium">
                              {renter.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {renter.name || 'No name'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {renter.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {renter.bookings?.length || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            {/* Sub-tabs for approvals */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setSubTab('cars')}
                className={`px-4 py-2 font-medium ${subTab === 'cars' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Car Approvals ({stats.pendingCars})
              </button>
              <button
                onClick={() => setSubTab('owners')}
                className={`px-4 py-2 font-medium ${subTab === 'owners' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Owner Approvals ({stats.pendingOwners})
              </button>
            </div>

            {/* Car Approvals */}
            {subTab === 'cars' && (
              pendingCars.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No pending car approvals</h3>
                  <p className="mt-1 text-gray-500">All cars have been approved.</p>
                </div>
              ) : (
                pendingCars.map(car => (
                  <div key={`car-${car.id}`} className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                          {car.imageUrls?.[0] ? (
                            <img
                              src={car.imageUrls[0]}
                              alt={`${car.make} ${car.model}`}
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                e.target.className = 'w-full h-48 object-contain bg-gray-100 p-4 rounded-lg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-lg">
                              <span className="text-gray-400">No Image Available</span>
                            </div>
                          )}
                        </div>
                        <div className="w-full md:w-2/3">
                          <h3 className="text-xl font-bold">{car.make} {car.model} ({car.year})</h3>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Price/Day</p>
                              <p className="font-medium">${car.pricePerDay}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium">{car.location || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Owner</p>
                              <p className="font-medium">{car.ownerEmail || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Submitted</p>
                              <p className="font-medium">
                                {formatDate(car.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-gray-500">Description</p>
                            <p className="mt-1">{car.description || 'No description provided'}</p>
                          </div>
                          <div className="mt-6 flex justify-end space-x-3">
                            <button
                              onClick={() => handleRejectCar(car.id)}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveCar(car.id)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

            {/* Owner Approvals */}
            {subTab === 'owners' && (
              pendingOwners.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No pending owner approvals</h3>
                  <p className="mt-1 text-gray-500">All owners have been approved.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingOwners.map(owner => (
                          <tr key={owner.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">
                                    {owner.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {owner.name || 'No name provided'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {owner.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(owner.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleApproveOwner(owner.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}