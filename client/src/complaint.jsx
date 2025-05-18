import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import 'react-toastify/dist/ReactToastify.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const ComplaintDetails = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('case_id');
  const chatContainerRef = useRef(null);

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isMarkingResolved, setIsMarkingResolved] = useState(false);
  const [statusUpdated, setStatusUpdated] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('No case ID specified in query string');
      setLoading(false);
      return;
    }

    const fetchComplaintData = async () => {
      try {
        // Fetch complaint details
        const complaintResponse = await fetch(`http://localhost/My%20project/CivicPulse/server/getInfo.php?id=${encodeURIComponent(id)}`);
        if (complaintResponse.status === 404) {
          throw new Error('Complaint not found');
        }
        if (!complaintResponse.ok) {
          const errorText = await complaintResponse.text();
          console.error('getInfo.php response:', errorText);
          throw new Error(`Failed to fetch complaint: HTTP ${complaintResponse.status}`);
        }
        const complaintData = await complaintResponse.json();
        if (complaintData.error) throw new Error(complaintData.error);
        if (!complaintData.case_id) {
          console.warn('Missing case_id in complaint data:', complaintData);
          throw new Error('Invalid complaint data');
        }
        
        // Transform coordinates data for Leaflet
        const transformedComplaint = {
          ...complaintData,
          status: complaintData.status || 'pending',
          coordinates: complaintData.coordinates ? [
            complaintData.coordinates.latitude,
            complaintData.coordinates.longitude
          ] : null
        };
        
        setComplaint(transformedComplaint);

        // Fetch chat messages
        const chatResponse = await fetch(`http://localhost/My%20project/CivicPulse/server/getDiscussions.php?id=${encodeURIComponent(id)}`);
        if (!chatResponse.ok) {
          const errorText = await chatResponse.text();
          console.error('getDiscussions.php response:', errorText);
          throw new Error(`Failed to fetch chat messages: HTTP ${chatResponse.status}`);
        }
        const chatData = await chatResponse.json();
        if (chatData.error) throw new Error(chatData.error);
        setMessages(chatData.messages || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaintData();
  }, [id, statusUpdated]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') {
      toast.warn('Please enter a message');
      return;
    }

    try {
      const tempId = Date.now();
      const newMsg = {
        id: tempId,
        sender: 'You',
        text: newMessage,
        time: new Date().toISOString()
      };

      setMessages([...messages, newMsg]);
      setNewMessage('');

      const response = await fetch(`http://localhost/My%20project/CivicPulse/server/addDiscussion.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_id: id,
          message: newMessage,
          sender: 'user'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: HTTP ${response.status}, ${errorText}`);
      }

      const result = await response.json();
      if (result.success && result.message) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, id: result.message.id } : msg
        ));
        toast.success('Message sent successfully');
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setError('Failed to send message');
      toast.error('Failed to send message');
    }
  };

  const handleMarkAsResolved = async () => {
    if (!id || typeof id !== 'string') {
      setError('Invalid case ID');
      toast.error('Invalid case ID');
      return;
    }

    setIsMarkingResolved(true);
    try {
      const response = await fetch(`http://localhost/My%20project/CivicPulse/server/update3.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ case_id: id })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update status: HTTP ${response.status}, ${errorText}`);
      }

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setStatusUpdated(prev => !prev);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'System',
          text: 'This case has been marked as resolved.',
          time: new Date().toISOString()
        }
      ]);

      toast.success('Complaint marked as resolved');
    } catch (err) {
      console.error('Mark as resolved error:', err);
      setError(err.message);
      toast.error('Failed to mark as resolved');
    } finally {
      setIsMarkingResolved(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading complaint details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Complaint</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (!complaint) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-700 mt-4">No Complaint Found</h3>
        <p className="text-gray-500 mt-1">The requested complaint does not exist.</p>
        <button 
          onClick={() => window.history.back()} 
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header Section - Stacked on mobile */}
        <div className="p-4 sm:p-6 bg-blue-600 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold truncate">Complaint #{complaint.case_id}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 sm:mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {complaint.status ? complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1) : 'Unknown'}
                </span>
                <span className="text-xs sm:text-sm text-blue-100 truncate">
                  Last updated: {new Date().toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {complaint.status !== 'resolved' && (
                <button 
                  onClick={handleMarkAsResolved}
                  disabled={isMarkingResolved}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center justify-center disabled:bg-green-400 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isMarkingResolved ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Resolve
                    </>
                  )}
                </button>
              )}
              <button 
                onClick={() => window.history.back()}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-700 rounded-lg hover:bg-blue-800 transition flex items-center justify-center text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Stacked on mobile */}
        <div className="flex flex-col md:flex-row">
          {/* Left Panel - Details and Chat */}
          <div className="w-full md:w-1/2 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-gray-200">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">Complaint Details</h2>
              <div className="space-y-3 sm:space-y-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Complainant Name</p>
                  <p className="text-sm sm:text-base text-gray-800">{complaint.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Contact Number</p>
                  <p className="text-sm sm:text-base text-gray-800">{complaint.number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Description</p>
                  <p className="text-sm sm:text-base text-gray-800">{complaint.details || 'No description provided'}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">Updates & Messages</h2>
              <div 
                ref={chatContainerRef}
                className="h-48 sm:h-64 overflow-y-auto mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 sm:space-y-3"
              >
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'You' || message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[75%] sm:max-w-xs md:max-w-md rounded-lg p-2 sm:p-3 text-sm sm:text-base ${
                          message.sender === 'You' || message.sender === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : message.sender === 'System'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {message.sender !== 'System' && (
                          <p className="font-medium text-xs mb-1">
                            {message.sender === 'You' ? 'You' : message.sender}
                          </p>
                        )}
                        <p>{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'You' || message.sender === 'user' 
                            ? 'text-blue-100' 
                            : message.sender === 'System'
                            ? 'text-purple-500'
                            : 'text-gray-500'
                        }`}>
                          {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm sm:text-base">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="w-full md:w-1/2 h-64 sm:h-80 md:h-auto">
            {complaint.coordinates ? (
              <MapContainer
                center={complaint.coordinates}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={complaint.coordinates}>
                  <Popup className="font-medium">
                    <p>Complaint Location</p>
                    <p className="text-sm text-gray-600">
                      {complaint.details ? `${complaint.details.substring(0, 50)}...` : 'No description available'}
                    </p>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-100 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 sm:h-16 w-12 sm:w-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm sm:text-base text-gray-500 text-center">No location data available</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Location not shared</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;