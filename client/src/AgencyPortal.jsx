import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AgencyPortal = () => {
  const [agencyName, setAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const switchTab = (tab) => {
    setActiveTab(tab);
    setAgencyName('');
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost/My%20project/CivicPulse/server/register.php/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agencyName, 
          email, 
          password 
        }),
        credentials: 'include'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      setSuccessMessage(`Agency "${result.agencyName}" registered successfully!`);
      setTimeout(() => {
        switchTab('login');
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost/My%20project/CivicPulse/server/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          password 
        }),
        credentials: 'include'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      navigate(`/agency-dashboard/?agency=${result.agency.name}`);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg transition-all duration-300">
        <div className="flex items-center mb-6">
          <svg
            onClick={() => navigate('/')}
            className="w-6 h-6 mr-3 text-gray-600 cursor-pointer"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Go back"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800">Agency Portal</h2>
        </div>

        <div className="flex justify-center mb-6 border-b border-gray-200">
          <button
            onClick={() => switchTab('login')}
            className={`px-6 py-2 text-gray-700 font-medium border-b-2 ${
              activeTab === 'login' ? 'border-blue-500 text-blue-500' : 'border-transparent'
            } hover:border-blue-400 hover:text-blue-400 transition-all duration-200`}
          >
            Login
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`px-6 py-2 text-gray-700 font-medium border-b-2 ${
              activeTab === 'register' ? 'border-blue-500 text-blue-500' : 'border-transparent'
            } hover:border-blue-400 hover:text-blue-400 transition-all duration-200`}
          >
            Register
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center border border-red-200">
            <svg 
              className="w-5 h-5 inline-block mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-center border border-green-200">
            <svg 
              className="w-5 h-5 inline-block mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {successMessage}
          </div>
        )}

        {activeTab === 'login' ? (
          <>
            <div className="mb-6 text-center">
              <svg width="24" height="24" fill="currentColor" className="mx-auto mb-2 text-gray-600">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Agency Login</h3>
              <p className="text-gray-500 text-sm">Access your agency dashboard</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2 text-left">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2 text-left">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 hover:shadow-lg hover:scale-105 transform transition-all duration-300"
              >
                Login to Dashboard
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6 text-center">
              <svg width="24" height="24" fill="currentColor" className="mx-auto mb-2 text-gray-600">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Agency Registration</h3>
              <p className="text-gray-500 text-sm">Create your agency account</p>
            </div>
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div>
                <label htmlFor="agencyNameRegister" className="block text-gray-700 text-sm font-medium mb-2 text-left">
                  Agency Name
                </label>
                <input
                  type="text"
                  id="agencyNameRegister"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Enter your agency name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2 text-left">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
                  required
                />
              </div>
              <div>
                <label htmlFor="passwordRegister" className="block text-gray-700 text-sm font-medium mb-2 text-left">
                  Password
                </label>
                <input
                  type="password"
                  id="passwordRegister"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 hover:shadow-lg hover:scale-105 transform transition-all duration-300"
              >
                Register Agency
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AgencyPortal;