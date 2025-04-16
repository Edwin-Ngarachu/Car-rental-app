// src/pages/PendingApproval.jsx
import { Link } from 'react-router-dom';

export default function PendingApproval() {
  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Account Pending Approval</h1>
      <p className="mb-4">
        Your owner account is under review. We'll notify you via email once approved.
      </p>
      <Link 
        to="/" 
        className="text-blue-600 hover:underline"
      >
        Return to Home
      </Link>
    </div>
  );
}