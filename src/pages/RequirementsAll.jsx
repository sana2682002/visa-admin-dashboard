import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../api/axiosConfig";

const MySwal = withReactContent(Swal);

export default function RequirementsAll() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const requirementsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await api.get("/admin/requirements", {
          params: { requirement_name: searchTerm }  // ✅ التعديل المهم
        });
        setRequirements(response.data.requirements);
      } catch (error) {
        console.error("Error fetching requirements:", error);
        MySwal.fire({
          title: "Error!",
          text: "Failed to load requirements",
          icon: "error",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, [searchTerm]);

  const handleDelete = async (id) => {
    const confirm = await MySwal.fire({
      title: "Delete Requirement?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7a0d0d",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      customClass: { popup: "rounded-xl" }
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/requirements/${id}`);
        setRequirements(prev => prev.filter(r => r.id !== id));

        await MySwal.fire({
          title: "Deleted!",
          text: "Requirement has been deleted.",
          icon: "success",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
      } catch (error) {
        MySwal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete requirement",
          icon: "error",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
      }
    }
  };

  const indexOfLast = currentPage * requirementsPerPage;
  const indexOfFirst = indexOfLast - requirementsPerPage;
  const currentRequirements = requirements.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(requirements.length / requirementsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7a0d0d]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Requirements Management</h1>
        <p className="text-gray-600">View and manage all visa requirements</p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requirements..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d]"
          />
        </div>
        <button
          onClick={() => navigate("/requirements/add")}
          className="bg-[#7a0d0d] hover:bg-[#5e0b0b] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiPlus /> Add New
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f8f1f1]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRequirements.length > 0 ? (
                currentRequirements.map((req, index) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{indexOfFirst + index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.requirement_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{req.description || "No description"}</td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => navigate(`/requirements/edit/${req.id}`)}
                        className="text-[#7a0d0d] hover:text-[#5e0b0b] inline-flex items-center"
                      >
                        <FiEdit2 className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="text-red-600 hover:text-red-800 inline-flex items-center"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? "No matching requirements found" : "No requirements available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLast, requirements.length)}</span> of{" "}
                <span className="font-medium">{requirements.length}</span> requirements
              </p>
              <div className="inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-2 border border-gray-300 rounded-l-md text-sm text-gray-500 bg-white hover:bg-gray-50"
                >
                  <FiChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? "z-10 bg-[#f8f1f1] border-[#7a0d0d] text-[#7a0d0d]"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-2 border border-gray-300 rounded-r-md text-sm text-gray-500 bg-white hover:bg-gray-50"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
