import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiFileText } from "react-icons/fi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../api/axiosConfig";

const MySwal = withReactContent(Swal);

export default function RequirementAdd() {
  const [formData, setFormData] = useState({
    requirement_name: "",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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
      await api.post("/admin/requirements", formData);

      await MySwal.fire({
        title: "Added!",
        text: "Requirement has been added successfully.",
        icon: "success",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });

      setFormData({ requirement_name: "", description: "" });
    } catch (error) {
      console.error("Add error:", error);
      MySwal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add requirement.",
        icon: "error",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={() => navigate("/requirements/all")}
          className="flex items-center text-[#7a0d0d] hover:text-[#5e0b0b] transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Requirements
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add New Requirement</h1>
        <p className="text-gray-600">Create a new requirement for visa types</p>
      </header>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Requirement Name */}
          <div className="space-y-1">
            <label htmlFor="requirement_name" className="block text-sm font-medium text-gray-700">
              Requirement Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCheckCircle className="text-gray-400" />
              </div>
              <input
                type="text"
                id="requirement_name"
                name="requirement_name"
                value={formData.requirement_name}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d]"
                placeholder="Enter requirement name"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <div className="relative">
              <div className="absolute top-2 left-3 flex items-start pointer-events-none">
                <FiFileText className="text-gray-400 mt-1" />
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d]"
                placeholder="Optional description for this requirement"
              />
            </div>
          </div>

          {/* Submit */}
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
                "Add Requirement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
