import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TrackCase = () => {
  const [caseId, setCaseId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost/My%20project/CivicPulse/server/trackCase.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId }),
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/status-dashboard?caseId=${data.caseId}&progress=${data.progress}`);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Server error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <header className="relative">
        <img src="https://picsum.photos/1200/400?random=8" alt="Cityscape" className="w-full h-64 object-cover" />
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 flex flex-col justify-center items-center text-white">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Track Your Case
          </h1>
          <p className="text-lg mt-2">Stay updated on your community issues</p>
        </div>
      </header>
      <div className="max-w-5xl mx-auto p-6 -mt-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <svg className="w-8 h-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">Enter Your Case ID</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="caseId" className="block text-gray-700 text-sm font-bold mb-2">Case ID</label>
              <input
                type="text"
                id="caseId"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="e.g. CIV-123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 hover:shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out"
            >
              Track Case
            </button>
          </form>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 hover:shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackCase;