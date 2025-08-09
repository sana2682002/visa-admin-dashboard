import React, { useState, useEffect } from "react";
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import { FiUsers, FiFileText, FiMessageSquare, FiGlobe } from 'react-icons/fi';

// Axios configuration
const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Custom chart components for consistency
const ChartContainer = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="h-80">{children}</div>
  </div>
);

const StatCard = ({ title, value, icon, trend, color }) => {
  const Icon = icon;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${trend.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-gray-500 ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/admin/dashboard-stats");
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7a0d0d]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Chart data configurations
  const charts = {
    applicationStatus: {
      labels: ['Pending', 'Under Review', 'Approved', 'Rejected'],
      datasets: [{
        data: [
          stats.applications.pending,
          stats.applications.under_review,
          stats.applications.approved,
          stats.applications.rejected
        ],
        backgroundColor: [
          'rgba(107, 114, 128, 0.8)',
          'rgba(79, 70, 229, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(107, 114, 128, 1)',
          'rgba(79, 70, 229, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1
      }]
    },
    topCountries: {
      labels: stats.top_countries.map(c => c.country_name),
      datasets: [{
        data: stats.top_countries.map(c => c.applications_count),
        backgroundColor: [
          'rgba(79, 70, 229, 0.6)',
          'rgba(99, 102, 241, 0.6)',
          'rgba(167, 139, 250, 0.6)',
          'rgba(192, 132, 252, 0.6)',
          'rgba(232, 121, 249, 0.6)'
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(167, 139, 250, 1)',
          'rgba(192, 132, 252, 1)',
          'rgba(232, 121, 249, 1)'
        ],
        borderWidth: 1
      }]
    },
    monthlyApplications: {
      labels: Object.keys(stats.monthly_applications).map(m => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames[parseInt(m) - 1] || m;
      }),
      datasets: [{
        label: 'Applications',
        data: Object.values(stats.monthly_applications),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    documentStatus: {
      labels: ['Pending', 'Valid', 'Invalid'],
      datasets: [{
        data: [
          stats.documents_status.pending,
          stats.documents_status.valid,
          stats.documents_status.invalid
        ],
        backgroundColor: [
          'rgba(251, 191, 36, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(239, 68, 68, 0.6)'
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1
      }]
    }
  };

  // Chart options for consistency
  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 20,
          font: {
            size: 13
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.users_count} 
          icon={FiUsers} 
          trend={{ value: 12.5, label: "vs last month" }}
          color="text-indigo-600"
        />
        <StatCard 
          title="New Users (30 Days)" 
          value={stats.users_last_30_days} 
          icon={FiUsers} 
          color="text-green-600"
        />
        <StatCard 
          title="Visa Types" 
          value={stats.visa_types_count} 
          icon={FiFileText} 
          color="text-purple-600"
        />
        <StatCard 
          title="Feedback Count" 
          value={stats.feedback_count} 
          icon={FiMessageSquare} 
          color="text-pink-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Visa Applications Status">
          <Bar 
            data={charts.applicationStatus} 
            options={chartOptions} 
          />
        </ChartContainer>
        
        <ChartContainer title="Top Countries by Applications">
          <Doughnut 
            data={charts.topCountries} 
            options={chartOptions} 
          />
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Monthly Applications Trend">
          <Bar 
            data={charts.monthlyApplications} 
            options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    drawBorder: false
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            }} 
          />
        </ChartContainer>
        
        <ChartContainer title="Documents Validation Status">
          <Pie 
            data={charts.documentStatus} 
            options={chartOptions} 
          />
        </ChartContainer>
      </div>
    </div>
  );
}
