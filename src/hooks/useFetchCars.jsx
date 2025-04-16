// src/hooks/useFetchCars.js
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function useFetchCars(filters = {}) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        let q = collection(db, 'cars');
        
        // Apply filters if provided (e.g., location, price range)
        if (filters.location) {
          q = query(q, where('location', '==', filters.location));
        }
        
        const querySnapshot = await getDocs(q);
        const carsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCars(carsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [filters]); // Re-fetch when filters change

  return { cars, loading, error };
}