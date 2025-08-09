import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiGlobe } from "react-icons/fi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../api/axiosConfig";

const MySwal = withReactContent(Swal);

export default function VisaTypeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    country_id: "",
    visa_name: "",
    description: ""
  });
  const [countries, setCountries] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [selectedReqs, setSelectedReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, requirementsRes, visaRes] = await Promise.all([
          api.get("/admin/countries"),
          api.get("/admin/requirements"),
          api.put(`/admin/visa-types/${id}`)
        ]);

        setCountries(countriesRes.data.countries);
        setRequirements(requirementsRes.data.requirements);

        if (!visaRes.data || !visaRes.data.visa_type) {
          throw new Error("Visa type not found");
        }

        const visaType = visaRes.data.visa_type;
        setFormData({
          country_id: visaType.country_id || "",
          visa_name: visaType.visa_name || "",
          description: visaType.description || ""
        });

        const assignedRes = await api.get(`/admin/visa-types/${id}/requirements`);
        setSelectedReqs(assignedRes.data.requirements.map(r => r.id));
      } catch (error) {
        console.error("Error loading data:", error);
        MySwal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to load visa type or requirements",
          icon: "error",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
        navigate("/visa-types/all");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleRequirement = (reqId) => {
    setSelectedReqs(prev =>
      prev.includes(reqId)
        ? prev.filter(id => id !== reqId)
        : [...prev, reqId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.put(`/admin/visa-types/${id}`, formData);

      await api.put(`/admin/visa-types/${id}/update-requirements`, {
        requirement_ids: selectedReqs
      });

      await MySwal.fire({
        title: "Success!",
        text: "Visa type updated successfully",
        icon: "success",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });

      navigate("/visa-types/all");
    } catch (error) {
      console.error("Update error:", error);
      MySwal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update visa type",
        icon: "error",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7a0d0d]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="mb-8">
        <button
          onClick={() => navigate("/visa-types/all")}
          className="flex items-center text-[#7a0d0d] hover:text-[#5e0b0b] transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Visa Types
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Visa Type</h1>
        <p className="text-gray-600">Update the details for this visa type</p>
      </header>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="visa_name" className="block text-sm font-medium text-gray-700">
              Visa Name
            </label>
            <input
              type="text"
              id="visa_name"
              name="visa_name"
              value={formData.visa_name}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d]"
              placeholder="Enter visa type name"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d]"
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="country_id" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiGlobe className="text-gray-400" />
              </div>
              <select
                id="country_id"
                name="country_id"
                value={formData.country_id}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d]"
              >
                <option value="">Select a country</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.country_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Requirements
            </label>
            <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {requirements.map(req => (
                  <div key={req.id} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={`req-${req.id}`}
                        name={`req-${req.id}`}
                        type="checkbox"
                        checked={selectedReqs.includes(req.id)}
                        onChange={() => toggleRequirement(req.id)}
                        className="h-4 w-4 text-[#7a0d0d] focus:ring-[#7a0d0d] border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={`req-${req.id}`} className="font-medium text-gray-700">
                        {req.requirement_name}
                      </label>
                      <p className="text-gray-500">{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center bg-[#7a0d0d] hover:bg-[#5e0b0b] text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Visa Type"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
