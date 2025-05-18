import React from "react";
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <header className="relative">
        <img
          src="https://picsum.photos/1200/400?random=9"
          alt="Community Scene"
          className="w-full h-[300px] object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/70 to-black/40 flex flex-col justify-center pl-10 md:pl-16 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Community Voice
          </h1>
          <p className="text-lg md:text-xl mt-2">Report issues. Track progress. Improve together.</p>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="p-6 max-w-5xl mx-auto -mt-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">Welcome to huzaApp</h2>
          <p className="mb-6 text-gray-600">
            Your direct line to local agencies. Report issues in your community and track their resolution in real-time.
          </p>

          {/* Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/send-complaint')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 hover:scale-105 transform transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Send Complaint
            </button>
            <button
              onClick={() => navigate('/track-case')}
              className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 hover:scale-105 transform transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              View Case
            </button>
            <button
              onClick={() => navigate('/agency-portal')}
              className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 hover:scale-105 transform transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              I am Agency
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
          <img
            src="https://picsum.photos/600/200?random=10"
            alt="Fast Response"
            className="rounded-t-lg w-full h-32 object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold text-gray-800">Fast Response</h3>
            <p className="text-sm text-gray-600">Issues resolved quickly</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
          <img
            src="https://picsum.photos/600/200?random=11"
            alt="Transparent Process"
            className="rounded-t-lg w-full h-32 object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold text-gray-800">Transparent Process</h3>
            <p className="text-sm text-gray-600">Track every step</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            Submit your complaint with optional (photo and location) where you see needed...
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l-2 6h-4l3 5-2 6 5-3 5 3-2-6 3-5h-4l-2-6zm0 4.5l1.5 4.5h3.5l-2.5 3 1 3.5-3-2-3 2 1-3.5-2.5-3h3.5l1.5-4.5z"/>
            </svg>
            Our system automatically assigns it to the right agency using AI analysis
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h6v6H4zm8 0h8v2h-8zm0 4h8v2h-8zm-8 4h6v6H4zm8 0h8v2h-8zm0 4h8v2h-8z"/>
            </svg>
            Receive a unique case ID to track your complaint
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            Get real-time updates until your issue is resolved
          </li>

         
             <li className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h6v6H4zm8 0h8v2h-8zm0 4h8v2h-8zm-8 4h6v6H4zm8 0h8v2h-8zm0 4h8v2h-8z"/>
            </svg>
             Agencies and reporters can keep in touch by comment-like discussions on complaint
          </li>

             <li className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h6v6H4zm8 0h8v2h-8zm0 4h8v2h-8zm-8 4h6v6H4zm8 0h8v2h-8zm0 4h8v2h-8z"/>
            </svg>
            <strong>Agencies:</strong>  &nbsp;&nbsp; If user allow us to track location, you will view the location of issue on map directly when you visit the complaint
          </li>
        </ol>
      </section>

 
      <footer className="text-center py-6 text-gray-500">
        <p>© 2025 HuzaApp. Last updated: 09:58 PM CAT, May 17, 2025<br /> 
            <a href="mailto:alainbarsime@gmail.com" className="text-blue-500 hover:underline">
                Mail Developer
            </a>
            
        </p>
      </footer>
    </div>
  );
}