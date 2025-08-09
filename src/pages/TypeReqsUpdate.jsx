import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function TypeReqsUpdate() {
  const { id } = useParams(); // visaTypeId from URL
  const [allRequirements, setAllRequirements] = useState([]);
  const [selectedReqIds, setSelectedReqIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const [allReqsRes, visaTypeReqsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/admin/requirements'),
          axios.get(`http://127.0.0.1:8000/api/admin/visa-types/${id}/requirements`)
        ]);

        setAllRequirements(allReqsRes.data.requirements);
        setSelectedReqIds(visaTypeReqsRes.data.requirements.map(r => r.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, [id]);

  const handleCheckboxChange = (requirementId) => {
    setSelectedReqIds(prevIds =>
      prevIds.includes(requirementId)
        ? prevIds.filter(id => id !== requirementId)
        : [...prevIds, requirementId]
    );
  };

  const handleUpdateRequirements = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/admin/visa-types/${id}/update-requirements`, {
        requirement_ids: selectedReqIds
      });
      alert('Requirements updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update requirements');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Update Visa Type Requirements</h2>
      <div className="bg-white p-4 shadow rounded-md">
        {allRequirements.map(req => (
          <label key={req.id} className="flex items-center gap-2 my-2">
            <input
              type="checkbox"
              checked={selectedReqIds.includes(req.id)}
              onChange={() => handleCheckboxChange(req.id)}
            />
            {req.requirement_name}
          </label>
        ))}
      </div>
      <button
        onClick={handleUpdateRequirements}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Save Changes
      </button>
    </div>
  );
}
