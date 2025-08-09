import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiFilter, FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Modal from "react-modal";
import api from "../api/axiosConfig";

const MySwal = withReactContent(Swal);
Modal.setAppElement("#root");

export default function VisaTypeAll() {
  const [visaTypes, setVisaTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalVisaName, setModalVisaName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // تحميل كل أنواع الفيزا بدون فلتر أولاً
        const [countriesRes, visaTypesRes] = await Promise.all([
          api.get("/admin/countries"),
          api.get("/admin/visa-types")
        ]);
        
        setCountries(countriesRes.data.countries);
        setVisaTypes(visaTypesRes.data.visa_types);
      } catch (error) {
        console.error("Error loading initial data:", error);
        MySwal.fire({
          title: "Error!",
          text: "Failed to load initial data",
          icon: "error",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    // يتم تنفيذ هذا فقط عند تغيير الفلتر
    if (selectedCountryId) {
      const fetchFilteredData = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/admin/visa-types?country_id=${selectedCountryId}`);
          setVisaTypes(res.data.visa_types);
          setCurrentPage(1); // العودة للصفحة الأولى بعد الفلترة
        } catch (error) {
          console.error("Error filtering data:", error);
          MySwal.fire({
            title: "Error!",
            text: "Failed to filter visa types",
            icon: "error",
            confirmButtonColor: "#7a0d0d",
            customClass: { popup: "rounded-xl" }
          });
        } finally {
          setLoading(false);
        }
      };

      fetchFilteredData();
    }
  }, [selectedCountryId]);

  const handleDelete = async (id) => {
    const confirm = await MySwal.fire({
      title: "Delete Visa Type?",
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
        await api.delete(`/admin/visa-types/${id}`);
        setVisaTypes(prev => prev.filter(v => v.id !== id));
        
        await MySwal.fire({
          title: "Deleted!",
          text: "Visa type has been deleted.",
          icon: "success",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
      } catch (error) {
        MySwal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete visa type",
          icon: "error",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
      }
    }
  };

  const viewRequirements = async (visaId, visaName) => {
    try {
      const res = await api.get(`/admin/visa-types/${visaId}/requirements`);
      setSelectedRequirements(res.data.requirements);
      setModalVisaName(visaName);
      setModalIsOpen(true);
    } catch (error) {
      console.error("Error loading requirements:", error);
      MySwal.fire({
        title: "Error!",
        text: "Could not load requirements",
        icon: "error",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });
    }
  };

  const handleCountryFilter = (e) => {
    setSelectedCountryId(e.target.value);
  };

  const resetFilter = () => {
    setSelectedCountryId("");
  };

  // Pagination calculations
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentVisaTypes = visaTypes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(visaTypes.length / itemsPerPage);

  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7a0d0d]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Visa Types Management</h1>
        <p className="text-gray-600">View and manage all visa types</p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              value={selectedCountryId}
              onChange={handleCountryFilter}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a0d0d] focus:border-[#7a0d0d]"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.country_name}
                </option>
              ))}
            </select>
          </div>
          {selectedCountryId && (
            <button
              onClick={resetFilter}
              className="text-sm text-[#7a0d0d] hover:text-[#5e0b0b] underline"
            >
              Reset Filter
            </button>
          )}
        </div>
        <button
          onClick={() => navigate("/visa-types/add")}
          className="bg-[#7a0d0d] hover:bg-[#5e0b0b] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiPlus /> Add New Visa Type
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f8f1f1]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visa Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentVisaTypes.length > 0 ? (
                currentVisaTypes.map((visa, index) => (
                  <tr key={visa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {indexOfFirst + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {visa.country?.country_name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {visa.visa_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {visa.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => viewRequirements(visa.id, visa.visa_name)}
                        className="text-[#7a0d0d] hover:text-[#5e0b0b] inline-flex items-center"
                      >
                        <FiEye className="mr-1" /> View
                      </button>
                      <button
                        onClick={() => navigate(`/visa-types/edit/${visa.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                      >
                        <FiEdit2 className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(visa.id)}
                        className="text-red-600 hover:text-red-800 inline-flex items-center"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    {selectedCountryId ? "No visa types found for selected country" : "No visa types found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirst + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLast, visaTypes.length)}
                  </span>{' '}
                  of <span className="font-medium">{visaTypes.length}</span> visa types
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-[#f8f1f1] border-[#7a0d0d] text-[#7a0d0d]'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
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

      {/* Requirements Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Visa Requirements"
        className="max-w-2xl mx-auto my-20 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Requirements for {modalVisaName}
          </h2>
          <div className="border-t border-gray-200 pt-4 mt-4">
            {selectedRequirements.length > 0 ? (
              <ul className="space-y-3">
                {selectedRequirements.map((req) => (
                  <li key={req.id} className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-[#7a0d0d] mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{req.requirement_name}</p>
                      <p className="text-sm text-gray-500">{req.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No requirements found for this visa type.</p>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setModalIsOpen(false)}
              className="bg-[#7a0d0d] hover:bg-[#5e0b0b] text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}