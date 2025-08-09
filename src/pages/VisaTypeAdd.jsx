import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiGlobe, FiFileText, FiCheckSquare, FiPlus } from "react-icons/fi";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../api/axiosConfig";

const MySwal = withReactContent(Swal);

export default function VisaTypeAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    country_id: "",
    visa_name: "",
    description: ""
  });
  const [countries, setCountries] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [countriesRes, requirementsRes] = await Promise.all([
          api.get("/admin/countries"),
          api.get("/admin/requirements")
        ]);
        
        setCountries(countriesRes.data.countries);
        setRequirements(requirementsRes.data.requirements);
      } catch (error) {
        console.error("Error loading data:", error);
        MySwal.fire({
          title: "Error!",
          text: "Failed to load required data",
          icon: "error",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.visa_name || !formData.country_id) {
        throw new Error("Visa name and country are required");
      }

      // Add visa type
      const res = await api.post("/admin/visa-types", formData);
      const visaTypeId = res.data.visa_type.id;

      // Assign requirements if any selected
      if (selectedRequirements.length > 0) {
        await api.post(`/admin/visa-types/${visaTypeId}/assign-requirements`, {
          requirement_ids: selectedRequirements.map(r => r.value)
        });
      }

      await MySwal.fire({
        title: "Success!",
        text: "Visa type added successfully",
        icon: "success",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });

      navigate("/visa-types/all");
    } catch (error) {
      console.error("Error adding visa type:", error);
      MySwal.fire({
        title: "Error!",
        text: error.response?.data?.message || error.message || "Failed to add visa type",
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
        <h1 className="text-2xl font-bold text-gray-800">Add New Visa Type</h1>
        <p className="text-gray-600">Fill in the details below to create a new visa type</p>
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
            <Select
              isMulti
              options={requirements.map(r => ({
                value: r.id,
                label: r.requirement_name,
                description: r.description
              }))}
              value={selectedRequirements}
              onChange={setSelectedRequirements}
              className="text-sm"
              classNamePrefix="select"
              placeholder="Select requirements..."
              noOptionsMessage={() => "No requirements available"}
              formatOptionLabel={option => (
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500">{option.description}</div>
                  )}
                </div>
              )}
            />
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
                  Adding...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" /> Add Visa Type
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}