import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function TypeReqsView() {
  const { id } = useParams(); // visaTypeId from URL
  const [requirements, setRequirements] = useState([]);
  const [visaTypeName, setVisaTypeName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/admin/visa-types/${id}/requirements`);
        setRequirements(res.data.requirements);
        setVisaTypeName(res.data.visa_type);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, [id]);

  const handleRemove = async (requirementId) => {
    if (!confirm('Are you sure you want to remove this requirement?')) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/visa-types/${id}/requirements/${requirementId}`);
      setRequirements(requirements.filter(req => req.id !== requirementId));
      alert('Requirement removed successfully');
    } catch (err) {
      console.error(err);
      alert('Error removing requirement');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Requirements for Visa Type: <span className="text-purple-700">{visaTypeName}</span>
      </h2>

      {requirements.length === 0 ? (
        <p className="text-gray-600">No requirements assigned.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-purple-100">
              <th className="py-2 px-4 text-left">Requirement Name</th>
              <th className="py-2 px-4 text-left">Description</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map(req => (
              <tr key={req.id} className="border-b border-gray-200">
                <td className="py-2 px-4">{req.requirement_name}</td>
                <td className="py-2 px-4">{req.description || '—'}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleRemove(req.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
