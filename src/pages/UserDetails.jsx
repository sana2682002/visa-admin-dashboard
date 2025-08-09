import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiGlobe, FiCalendar } from 'react-icons/fi';
import api from '../api/axiosConfig';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/admin/users/${id}`);
        setUser(response.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7a0d0d]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded max-w-3xl mx-auto mt-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
            <p className="text-gray-600 mt-1">View all details for this user</p>
          </div>
          <button
            onClick={() => navigate("/users/all")}
            className="flex items-center text-[#7a0d0d] hover:text-[#5e0b0b] transition-colors font-medium"
          >
            <FiArrowLeft className="mr-2" /> Back to Users
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* User Profile Header */}
        <div className="bg-[#f8f1f1] p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-16 w-16 rounded-full bg-[#7a0d0d] flex items-center justify-center text-white text-2xl font-bold">
              {user.full_name.charAt(0)}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-[#7a0d0d]">{user.full_name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <DetailCard 
            icon={<FiUser className="text-[#7a0d0d]" />}
            title="Personal Information"
            items={[
              { label: 'Full Name', value: user.full_name },
              { label: 'Gender', value: user.gender || 'Not specified' },
              { label: 'Birth Date', value: user.birth_date ? new Date(user.birth_date).toLocaleDateString() : 'Not specified' },
            ]}
          />

          <DetailCard 
            icon={<FiMail className="text-[#7a0d0d]" />}
            title="Contact Information"
            items={[
              { label: 'Email', value: user.email },
              { label: 'Phone', value: user.phone || 'Not specified' },
            ]}
          />

          <DetailCard 
            icon={<FiGlobe className="text-[#7a0d0d]" />}
            title="Nationality"
            items={[
              { label: 'Country', value: user.nationality || 'Not specified' },
              { label: 'Passport Number', value: user.passport_number || 'Not specified' },
              { label: 'Passport Expiry', value: user.passport_expiry ? new Date(user.passport_expiry).toLocaleDateString() : 'Not specified' },
            ]}
          />

          <DetailCard 
            icon={<FiCalendar className="text-[#7a0d0d]" />}
            title="Account Information"
            items={[
              { label: 'Account Created', value: new Date(user.created_at).toLocaleDateString() },
              { label: 'Last Updated', value: new Date(user.updated_at).toLocaleDateString() },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, title, items }) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-3">
        <div className="p-2 rounded-lg bg-[#f8f1f1] mr-3">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-sm text-gray-500">{item.label}</span>
            <span className="text-sm font-medium text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}