import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX, FiDownload, FiEye } from "react-icons/fi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../api/axiosConfig";

const MySwal = withReactContent(Swal);

export default function ApplicationDetailed() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentLoading, setDocumentLoading] = useState(null); // هنا يستخدم كـ id تحميل

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/applications/${id}`);
        setApplication(response.data.application);
      } catch (error) {
        console.error("Error fetching application details:", error);
        MySwal.fire({
          title: "Error!",
          text: "Failed to load application details",
          icon: "error",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleApprove = async () => {
    // لا تغيير هنا
    const confirm = await MySwal.fire({
      title: "Approve Application?",
      text: "Are you sure you want to approve this application?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, approve",
      customClass: { popup: "rounded-xl" }
    });

    if (confirm.isConfirmed) {
      try {
        await api.put(`/admin/applications/${id}/approve`);
        await MySwal.fire({
          title: "Approved!",
          text: "Application has been approved successfully",
          icon: "success",
          confirmButtonColor: "#198754",
          customClass: { popup: "rounded-xl" }
        });
        navigate("/applications/all");
      } catch (error) {
        MySwal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to approve application",
          icon: "error",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
      }
    }
  };

  const handleReject = async () => {
    // لا تغيير هنا
    const { value: reason } = await MySwal.fire({
      title: "Reject Application?",
      input: "textarea",
      inputLabel: "Rejection Reason (optional)",
      inputPlaceholder: "Type the reason for rejection...",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Confirm Rejection",
      customClass: { popup: "rounded-xl" }
    });

    if (reason !== undefined) {
      try {
        await api.put(`/admin/applications/${id}/reject`, {
          rejection_reason: reason
        });
        await MySwal.fire({
          title: "Rejected!",
          text: "Application has been rejected",
          icon: "success",
          confirmButtonColor: "#dc3545",
          customClass: { popup: "rounded-xl" }
        });
        navigate("/applications/all");
      } catch (error) {
        MySwal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Failed to reject application",
          icon: "error",
          confirmButtonColor: "#7a0d0d",
          customClass: { popup: "rounded-xl" }
        });
      }
    }
  };

  const handleDocumentStatus = async (docId, status) => {
    // لا تغيير هنا
    try {
      await api.put(`/admin/documents/${docId}/validate`, { status });
      setApplication(prev => ({
        ...prev,
        documents: prev.documents.map(doc => 
          doc.id === docId ? { ...doc, validation_status: status } : doc
        )
      }));
      await MySwal.fire({
        title: "Success!",
        text: `Document marked as ${status}`,
        icon: "success",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });
    } catch (error) {
      MySwal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update document status",
        icon: "error",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });
    }
  };

  // ===== تعديل هنا: استدعاء الـAPI الصحيح باستخدام docId =====
  const viewDocument = async (docId) => {
    try {
      setDocumentLoading(docId);
      // نستخدم الـendpoint /admin/documents/{id}/preview 
      const response = await api.get(`/admin/documents/${docId}/preview`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error viewing document:", error);
      MySwal.fire({
        title: "Error!",
        text: "Failed to load document",
        icon: "error",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });
    } finally {
      setDocumentLoading(null);
    }
  };
  // ========================================================

  const downloadPdf = async () => {
    // لا تغيير هنا
    try {
      setDocumentLoading('pdf-download');
      const response = await api.get(`/admin/applications/${id}/download-pdf`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `application_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      MySwal.fire({
        title: "Error!",
        text: "Failed to download PDF",
        icon: "error",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });
    } finally {
      setDocumentLoading(null);
    }
  };

  const previewPdf = async () => {
    // لا تغيير هنا
    try {
      setDocumentLoading('pdf-preview');
      const response = await api.get(`/admin/applications/${id}/preview-pdf`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error previewing PDF:", error);
      MySwal.fire({
        title: "Error!",
        text: "Failed to preview PDF",
        icon: "error",
        confirmButtonColor: "#7a0d0d",
        customClass: { popup: "rounded-xl" }
      });
    } finally {
      setDocumentLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7a0d0d]"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <h3 className="text-lg font-medium text-gray-800">Application not found</h3>
          <Link 
            to="/applications/all" 
            className="mt-4 inline-flex items-center text-[#7a0d0d] hover:text-[#5e0b0b]"
          >
            <FiArrowLeft className="mr-1" /> Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-8">
        <button
          onClick={() => navigate("/applications/all")}
          className="flex items-center text-[#7a0d0d] hover:text-[#5e0b0b] transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Applications
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Visa Application Details</h1>
        <p className="text-gray-600">View and manage application details</p>
      </header>

      <div className="space-y-6">
        {/* Applicant Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-[#f8f1f1] border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Applicant Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="mt-1 text-sm text-gray-900">{application.user?.full_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">{application.user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Passport Number</p>
              <p className="mt-1 text-sm text-gray-900">{application.user?.passport_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Nationality</p>
              <p className="mt-1 text-sm text-gray-900">{application.user?.nationality || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-[#f8f1f1] border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Application Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Visa Type</p>
              <p className="mt-1 text-sm text-gray-900">{application.visa_type?.visa_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Country</p>
              <p className="mt-1 text-sm text-gray-900">{application.country?.country_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  application.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                  application.status === 'approved' ? 'bg-green-100 text-green-800' :
                  application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {application.status.replace('_', ' ')}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Submitted At</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(application.created_at).toLocaleDateString()} at{' '}
                {new Date(application.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
            {application.decision_date && (
              <div>
                <p className="text-sm font-medium text-gray-500">Decision Date</p>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(application.decision_date).toLocaleDateString()} at{' '}
                  {new Date(application.decision_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            )}
            {application.rejection_reason && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                <p className="mt-1 text-sm text-gray-900">{application.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-[#f8f1f1] border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Uploaded Documents</h2>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              {application.documents?.map((doc) => (
                <li key={doc.id} className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-sm font-medium text-gray-900 capitalize">{doc.document_type}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: <span className={`font-medium ${
                          doc.validation_status === 'valid' ? 'text-green-600' :
                          doc.validation_status === 'invalid' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {doc.validation_status || 'pending'}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* زرّ العرض بعد التعديل */}
                      <button
                        onClick={() => viewDocument(doc.id)}
                        disabled={documentLoading === doc.id}
                        className="inline-flex items-center text-[#7a0d0d] hover:text-[#5e0b0b] text-sm disabled:opacity-50"
                      >
                        {documentLoading === doc.id ? (
                          'Loading...'
                        ) : (
                          <>
                            <FiEye className="mr-1" /> View
                          </>
                        )}
                      </button>
                      {application.status === "under_review" && (
                        <>
                          <button
                            onClick={() => handleDocumentStatus(doc.id, "valid")}
                            className="inline-flex items-center text-green-600 hover:text-green-800 text-sm"
                          >
                            <FiCheck className="mr-1" /> Valid
                          </button>
                          <button
                            onClick={() => handleDocumentStatus(doc.id, "invalid")}
                            className="inline-flex items-center text-red-600 hover:text-red-800 text-sm"
                          >
                            <FiX className="mr-1" /> Invalid
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* PDF Actions */}
        {application.ai_pdf_path && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-[#f8f1f1] border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Application PDF</h2>
            </div>
            <div className="p-6 flex flex-wrap gap-3">
              <button
                onClick={previewPdf}
                disabled={documentLoading === 'pdf-preview'}
                className="flex items-center gap-2 bg-[#7a0d0d] hover:bg-[#5e0b0b] text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {documentLoading === 'pdf-preview' ? (
                  'Loading...'
                ) : (
                  <>
                    <FiEye /> View PDF
                  </>
                )}
              </button>
              <button
                onClick={downloadPdf}
                disabled={documentLoading === 'pdf-download'}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {documentLoading === 'pdf-download' ? (
                  'Loading...'
                ) : (
                  <>
                    <FiDownload /> Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {application.status === "under_review" && (
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={handleReject}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              <FiX /> Reject Application
            </button>
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              <FiCheck /> Approve Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
