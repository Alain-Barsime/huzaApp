import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const StatusDashboard = () => {
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  const [caseId, setCaseId] = useState(null);
  const [progress, setProgress] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCaseId(params.get('caseId'));
    const progressValue = params.get('progress');
    setProgress(progressValue === 'in process' ? 'in-progress' : progressValue);
  }, []);

  useEffect(() => {
    if (!caseId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost/My%20project/CivicPulse/server/getDiscussions.php?id=${encodeURIComponent(caseId)}`);
        if (!response.ok) throw new Error(`Failed to fetch messages: HTTP ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Fetch messages error:', err);
        setMessages([]);
        showNotification('Failed to load messages', 'error');
      }
    };

    fetchMessages();
  }, [caseId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      showNotification('Please enter a message', 'error');
      return;
    }
    if (!caseId) {
      showNotification('Case ID missing', 'error');
      return;
    }

    try {
      const tempId = Date.now();
      const newMsg = {
        id: tempId,
        comment: newMessage,
        created_at: new Date().toISOString().split('T')[0]
      };

      setMessages([...messages, newMsg]);
      setNewMessage('');

      const response = await fetch('http://localhost/My%20project/CivicPulse/server/post_comment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId, comment: newMessage })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON received:', text);
        showNotification('Invalid response from server', 'error');
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        return;
      }

      if (data.success && data.message) {
        setMessages(prev => prev.map(msg =>
          msg.id === tempId ? { ...msg, id: data.message.id, created_at: data.message.created_at } : msg
        ));
        showNotification('Message sent successfully', 'success');
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        showNotification(data.error || 'Failed to send message', 'error');
      }
    } catch (err) {
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      showNotification('Network error: ' + err.message, 'error');
    }
  };

  const doneSteps = progress === 'resolved' ? 3 : progress === 'in-progress' ? 2 : 1;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } flex items-center`}>
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {notification.type === 'error' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            )}
          </svg>
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          <div className="flex items-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Case ID: {caseId || 'N/A'}
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-800">Case Status Dashboard</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-blue-800">Current Status</h2>
            </div>
            <div className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                progress === 'resolved' ? 'bg-green-100 text-green-800' :
                progress === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {progress === 'resolved' ? 'Resolved' : 
                 progress === 'in-progress' ? 'In Progress' : 'Received'}
              </span>
              <span className="ml-2 text-gray-600 text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-800">Updates</h2>
            </div>
            <p className="text-gray-600 mb-3">
              {messages.length > 0 
                ? `You have ${messages.length} update${messages.length > 1 ? 's' : ''} on this case`
                : 'No updates yet'}
            </p>
            <button 
              onClick={() => chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
            >
              View messages
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Case Progress Timeline
          </h2>
          <div className="relative">
            <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200"></div>

            {[{
              title: 'Complaint Received',
              date: new Date().toLocaleDateString(),
              desc: 'Case has been received and is under review.',
              step: 1,
            }, {
              title: 'Investigation Started',
              date: new Date(Date.now() + 86400000).toLocaleDateString(),
              desc: 'Investigation has started by the agency.',
              step: 2,
            }, {
              title: 'Final Resolution',
              date: new Date(Date.now() + 172800000).toLocaleDateString(),
              desc: doneSteps === 3
                ? 'Your case has been successfully resolved. Thank you for your patience!'
                : 'Resolution pending',
              step: 3,
            }].map(({ title, date, desc, step }) => {
              const active = doneSteps >= step;
              return (
                <div key={step} className="relative flex items-start mb-6 group">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center z-10 transition-all duration-200 ${
                    active ? 'bg-green-100 shadow-md' : 'bg-gray-100'
                  }`}>
                    {active ? (
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z" />
                      </svg>
                    ) : (
                      <span className="text-gray-400">{step}</span>
                    )}
                  </div>
                  <div className={`ml-4 p-4 rounded-lg flex-grow shadow-sm border transition-all duration-200 ${
                    active ? 'bg-white border-green-200 shadow-md' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <p className={`font-medium ${active ? 'text-gray-800' : 'text-gray-500'}`}>{title}</p>
                      <p className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{date}</p>
                    </div>
                    <p className={`text-sm mt-2 ${active ? 'text-gray-600' : 'text-gray-400'}`}>
                      {desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Case Updates
          </h2>
          
          <div 
            ref={chatContainerRef}
            className="h-64 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4"
          >
            {messages.length > 0 ? (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className="flex justify-end"
                >
                  <div className="max-w-xs md:max-w-md rounded-xl p-3 bg-blue-500 text-white shadow-sm">
                    <p className="text-sm">{message.comment}</p>
                    <p className="text-xs mt-2 text-blue-100 opacity-80">
                      {new Date(message.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No messages yet</p>
                <p className="text-sm mt-1">Be the first to add an update</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDashboard;