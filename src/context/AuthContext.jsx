import { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp,updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  
  const isAdmin = (email, password) => {
    return email === "admin@rentcars.com" && password === "admin123";
  };

  const login = async (email, password) => {
    try {
      // Handle admin login
      if (isAdmin(email, password)) {
        const adminUser = { 
          email: email,
          uid: 'admin-uid',
          isAdmin: true
        };
        setCurrentUser(adminUser);
        setUserRole('admin');
        return navigate('/admin', { replace: true });
      }

      // Regular user login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (!userDoc.exists()) {
        throw new Error('User account not found');
      }

      const userData = userDoc.data();
      setUserRole(userData.role);

      // Handle owner approval status
      if (userData.role === 'owner' && !userData.approved) {
        return navigate('/pending-approval', { replace: true });
      }

      // Successful login for regular users
      return navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email, password, role) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        role,
        approved: role === 'owner' ? false : true,
        createdAt: serverTimestamp()
      });

      // After signup, redirect based on role
      if (role === 'owner') {
        navigate('/pending-approval', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        
        if (user.uid === 'admin-uid') {
          setCurrentUser({ ...user, isAdmin: true });
          setUserRole('admin');
          setLoading(false);
          return;
        }

        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser(user);
          setUserRole(userData.role);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const approveOwner = async (userId) => {
    try {
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }
  
      
      await updateDoc(doc(db, 'users', userId), {
        approved: true,
        approvedAt: serverTimestamp()
      });
  
      
      const updatedDoc = await getDoc(doc(db, 'users', userId));
      if (!updatedDoc.data().approved) {
        throw new Error('Update did not persist');
      }
  
      return { success: true };
    } catch (error) {
      console.error('Approval failed:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };
  const value = {
    currentUser,
    userRole,
    loading,
    login,
    signup,
    logout,
    approveOwner,
    isAdmin: userRole === 'admin',
    isOwner: userRole === 'owner'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}