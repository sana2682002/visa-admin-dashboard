import React, { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiTrash2, FiDownload } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../api/axiosConfig";

const MySwal = withReactContent(Swal);

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [filters, setFilters] = useState({
    rating: "",
    country_id: "",
    visa_type_id: ""
  });

  const [countries, setCountries] = useState([]);
  const [visaTypes, setVisaTypes] = useState([]);

  // Load filter options (countries & visa types) once on mount
  const fetchFilters = async () => {
    try {
      const [countriesRes, visaTypesRes] = await Promise.all([
        api.get("/admin/countries"),
        api.get("/admin/visa-types")
      ]);
      setCountries(countriesRes.data.countries);
      setVisaTypes(visaTypesRes.data.visa_types);
    } catch (error) {
      console.error("Error loading filters:", error);
      MySwal.fire({
        title: "Error!",
        text: "Failed to load filter options",
        icon: "error",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });
    }
  };

  // Fetch feedbacks with current filters and page, stripping out any empty filter values
  const fetchFeedbacks = async (page = 1) => {
    setLoading(true);
    try {
      // Build params object without empty strings
      const params = { page };
      if (filters.rating) params.rating = filters.rating;
      if (filters.country_id) params.country_id = filters.country_id;
      if (filters.visa_type_id) params.visa_type_id = filters.visa_type_id;

      const response = await api.get("/admin/feedbacks", { params });
      const data = response.data.data;
      setFeedbacks(data.data);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      MySwal.fire({
        title: "Error!",
        text: "Failed to load feedbacks",
        icon: "error",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });
    } finally {
      setLoading(false);
    }
  };

  // On mount: load filter dropdowns
  useEffect(() => {
    fetchFilters();
  }, []);

  // Whenever filters, countries/visaTypes finish loading, or currentPage changes, refetch feedbacks
  useEffect(() => {
    // Wait until filter options have been loaded at least once
    if (countries.length > 0 && visaTypes.length > 0) {
      fetchFeedbacks(currentPage);
    }
  }, [filters, countries, visaTypes, currentPage]);

  const handleDelete = async (id) => {
    const confirm = await MySwal.fire({
      title: "Delete Feedback?",
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
        await api.delete(`/admin/feedbacks/${id}`);
        await MySwal.fire({
          title: "Deleted!",
          text: "Feedback has been deleted.",
          icon: "success",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
        // After deletion, refetch current page
        fetchFeedbacks(currentPage);
      } catch (error) {
        MySwal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete feedback",
          icon: "error",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
      }
    }
  };

  const exportCSV = async () => {
    try {
      // Build export params similarly to fetchFeedbacks
      const params = {};
      if (filters.rating) params.rating = filters.rating;
      if (filters.country_id) params.country_id = filters.country_id;
      if (filters.visa_type_id) params.visa_type_id = filters.visa_type_id;

      const response = await api.get("/admin/feedbacks/export", {
        responseType: "blob",
        params
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `feedbacks_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
      MySwal.fire({
        title: "Error!",
        text: "Failed to export feedbacks",
        icon: "error",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page whenever filters change
    setCurrentPage(1);
  };

  const renderStars = (rating) => {
    if (!rating) return "—";
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${i < rating ? "text-yellow-400" : "text-gray-300"} text-lg`}
          />
        ))}
      </div>
    );
  };

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
        <h1 className="text-2xl font-bold text-gray-800">User Feedbacks</h1>
        <p className="text-gray-600">View and manage user feedbacks and ratings</p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange("rating", e.target.value)}
              className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d] text-sm"
            >
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} Stars
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={filters.country_id}
              onChange={(e) => handleFilterChange("country_id", e.target.value)}
              className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d] text-sm"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.country_name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={filters.visa_type_id}
              onChange={(e) => handleFilterChange("visa_type_id", e.target.value)}
              className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d] text-sm"
            >
              <option value="">All Visa Types</option>
              {visaTypes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.visa_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-[#7a0d0d] hover:bg-[#5e0b0b] text-white px-4 py-2 rounded-lg"
        >
          <FiDownload /> Export CSV
        </button>
      </div>

      {feedbacks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="text-gray-600">No feedbacks found matching your criteria</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#f8f1f1]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visa Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feedbacks.map((fb) => (
                    <tr key={fb.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {fb.user?.full_name}
                        </div>
                        <div className="text-sm text-gray-500">{fb.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{renderStars(fb.rating)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs line-clamp-2">
                          {fb.comment || "No comment"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {fb.country?.country_name}
                        </div>
                        <div className="text-sm text-gray-500">{fb.visa_type?.visa_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(fb.id)}
                          className="text-red-600 hover:text-red-800 inline-flex items-center"
                        >
                          <FiTrash2 className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                    disabled={currentPage === lastPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * 10 + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * 10, feedbacks.length + (currentPage - 1) * 10)}
                      </span>{" "}
                      of <span className="font-medium">{lastPage * 10}</span> feedbacks
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <FiChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? "z-10 bg-[#f8f1f1] border-[#7a0d0d] text-[#7a0d0d]"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                        disabled={currentPage === lastPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
