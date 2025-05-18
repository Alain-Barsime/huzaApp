import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

const AgencyDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BACKEND_URL = 'http://localhost/My%20project/CivicPulse/server';

  const handleLogout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/logout.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      localStorage.removeItem('authToken');
      navigate('/agency-portal');
    } catch (err) {
      setError(`Logout failed: ${err.message}`);
    }
  };

  const handleStatusClick = async (case_id) => {
    try {
      if (!case_id) {
        throw new Error('Case ID is undefined or null');
      }
      const payload = { case_id };

      const response = await fetch(`${BACKEND_URL}/process.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.id === case_id ? { ...complaint, status: 'in process' } : complaint
        )
      );
    } catch (err) {
      console.error('Status update error:', err);
      setError(`Failed to update status: ${err.message}`);
    }
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const agency = urlParams.get('agency') || 'Agency A';

        const response = await fetch(`${BACKEND_URL}/agency-dashboard.php?agency=${encodeURIComponent(agency)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const mappedComplaints = data.complaints.map(complaint => {
          const case_id = complaint.case_id;
          const hasImage = complaint.image && complaint.image.trim() !== '';
          return {
            id: case_id || `CIV-${Math.random().toString(36).substr(2, 6)}`,
            status: typeof complaint.progress === 'string' ? complaint.progress : 'not seen',
            date: complaint.created_at || new Date().toISOString().split('T')[0],
            agency: complaint.agency || agency,
            message: complaint.details || 'No description provided',
            hasImage,
            imageUrl: hasImage ? `${BACKEND_URL}${complaint.image}` : null,
          };
        });

        setComplaints(mappedComplaints);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  useEffect(() => {
    if (complaints.length === 0) return;

    const barChart = new Chart(document.getElementById('statusChart'), {
      type: 'bar',
      data: {
        labels: ['Not Seen', 'In Process', 'Resolved'],
        datasets: [{
          label: 'Complaints by Status',
          data: [
            complaints.filter(c => c.status === 'not seen').length,
            complaints.filter(c => c.status === 'in process').length,
            complaints.filter(c => c.status === 'resolved').length,
          ],
          backgroundColor: ['#3B82F6', '#FBBF24', '#10B981'],
          borderColor: ['#2563EB', '#D97706', '#059669'],
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => {
      barChart.destroy();
    };
  }, [complaints]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'not seen': return 'bg-blue-100 text-blue-800';
      case 'in process': return 'bg-yellow-100 text-yellow-800 opacity-75';
      case 'resolved': return 'bg-green-100 text-green-800 opacity-75';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isStatusClickable = (status) => {
    return status.toLowerCase() === 'not seen';
  };

  const handleComplaintClick = (id) => {
    navigate(`/complaint?case_id=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Loading complaints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  // Check if any complaint has an image to determine if we should show the image column
  const hasAnyImages = complaints.some(complaint => complaint.hasImage);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-blue-50 p-6">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Agency Complaint Dashboard
            </h1>
            <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleString()}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4">Complaint Overview</h2>
            <p className="text-blue-100">Total Complaints: {complaints.length}</p>
            <p className="text-blue-100">Not Seen: {complaints.filter(c => c.status.toLowerCase() === 'not seen').length}</p>
            <p className="text-blue-100">In Process: {complaints.filter(c => c.status.toLowerCase() === 'in process').length}</p>
            <p className="text-blue-100">Resolved: {complaints.filter(c => c.status.toLowerCase() === 'resolved').length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Complaints by Status</h2>
            <canvas id="statusChart" className="w-full h-64"></canvas>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Complaints</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-sm font-medium text-gray-700">Case ID</th>
                  <th className="p-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="p-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="p-4 text-sm font-medium text-gray-700">Agency</th>
                  <th className="p-4 text-sm font-medium text-gray-700">Complaint</th>
                  {hasAnyImages && <th className="p-4 text-sm font-medium text-gray-700">Image</th>}
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    onClick={() => handleComplaintClick(complaint.id)}
                    className="cursor-pointer hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <td className="p-4 border-t text-gray-800 font-medium">{complaint.id}</td>
                    <td className="p-4 border-t">
                      <span
                        onClick={isStatusClickable(complaint.status) ? (e) => {
                          e.stopPropagation();
                          handleStatusClick(complaint.id);
                        } : undefined}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)} ${isStatusClickable(complaint.status) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      >
                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 border-t text-gray-600">
                      {new Date(complaint.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 border-t text-gray-600">{complaint.agency}</td>
                    <td className="p-4 border-t text-gray-600 truncate max-w-xs">{complaint.message}</td>
                    {hasAnyImages && (
                      <td className="p-4 border-t">
                        {complaint.hasImage ? (
                          <img
                            src={complaint.imageUrl}
                            alt="Complaint"
                            className="h-12 w-12 object-cover rounded-lg group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">No image</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;