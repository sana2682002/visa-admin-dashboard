import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../api/axiosConfig";

const MySwal = withReactContent(Swal);

export default function RequirementEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    requirement_name: "",
    description: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        const response = await api.put(`/admin/requirements/${id}`);
        if (response.data && response.data.requirement) {
          setFormData({
            requirement_name: response.data.requirement.requirement_name || "",
            description: response.data.requirement.description || ""
          });
        } else {
          throw new Error("No requirement data found");
        }
      } catch (error) {
        console.error("Failed to load requirement", error);
        MySwal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to load requirement details",
          icon: "error",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
        navigate("/requirements/all");
      } finally {
        setLoading(false);
      }
    };

    fetchRequirement();
  }, [id, navigate]);

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
      await api.put(`/admin/requirements/${id}`, formData);

      await MySwal.fire({
        title: "Updated!",
        text: "Requirement has been updated successfully",
        icon: "success",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });

      navigate("/requirements/all");
    } catch (error) {
      console.error("Error updating requirement", error);
      MySwal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update requirement",
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
          onClick={() => navigate("/requirements/all")}
          className="flex items-center text-[#7a0d0d] hover:text-[#5e0b0b] transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Requirements
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Requirement</h1>
        <p className="text-gray-600">Update the details for this visa requirement</p>
      </header>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="requirement_name" className="block text-sm font-medium text-gray-700">
              Requirement Name
            </label>
            <input
              type="text"
              id="requirement_name"
              name="requirement_name"
              value={formData.requirement_name}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d]"
              placeholder="Enter requirement name"
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
              rows={4}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d]"
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="pt-2">
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
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}