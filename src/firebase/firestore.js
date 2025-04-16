
import { db } from './firebase';
import { 
  collection, addDoc, doc, updateDoc, deleteDoc 
} from 'firebase/firestore';


export const addCar = async (carData) => {
  const docRef = await addDoc(collection(db, 'cars'), carData);
  return docRef.id; 
};


export const updateBookingStatus = async (bookingId, status) => {
  await updateDoc(doc(db, 'bookings', bookingId), { status });
};


export const deleteCar = async (carId) => {
  await deleteDoc(doc(db, 'cars', carId));
};