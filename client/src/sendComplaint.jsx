import React, { useState, useRef } from "react";

const SendComplaint = () => {
  const [shareLocation, setShareLocation] = useState(false);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    details: "",
  });

  // New states for showing success overlay and storing caseId
  const [showSuccess, setShowSuccess] = useState(false);
  const [caseId, setCaseId] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("phone", formData.phone);
    payload.append("details", formData.details);

    if (image) {
      payload.append("image", image);
    }

    const sendToServer = async () => {
      try {
        const res = await fetch(
          "http://localhost/My%20project/CivicPulse/server/submit_complaint.php",
          {
            method: "POST",
            body: payload,
          }
        );
        const data = await res.json();
        if (data.status === "success") {
          setCaseId(data.data.case_id);
          setShowSuccess(true);
          // Optionally reset form here
          setFormData({ name: "", phone: "", details: "" });
          setImage(null);
          setShareLocation(false);
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (err) {
        alert("Failed to submit complaint. Please try again.");
      }
    };

    if (shareLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          payload.append("latitude", position.coords.latitude);
          payload.append("longitude", position.coords.longitude);
          sendToServer();
        },
        () => {
          sendToServer();
        }
      );
    } else {
      sendToServer();
    }
  };

  const copyToClipboard = () => {
    if (!caseId) return;
    navigator.clipboard.writeText(caseId).then(() => {
      setShowSuccess(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => (window.location.href = "/")}
            className="mr-2 text-xl text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold">Send Complaint</h2>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Complaint Details */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Complaint Details
            </label>
            <textarea
              name="details"
              rows={4}
              placeholder="Describe your issue in detail..."
              value={formData.details}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              Our AI will analyze your complaint to route it to the appropriate
              agency
            </p>
          </div>

          {/* Share Location Toggle */}
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
            <span className="font-medium">Share my location</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={shareLocation}
                onChange={() => setShareLocation(!shareLocation)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>

          {/* Drag & Drop File */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Add Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition"
            >
              {image ? (
                <p>{image.name}</p>
              ) : (
                <p>Drag & drop a photo or click here to browse</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Submit Complaint
          </button>
        </form>
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center relative">
            <h3 className="text-lg font-semibold mb-4">
              You have sent your complaint successfully!
            </h3>
            <p className="mb-4">
              <strong>Case ID:</strong> <code>{caseId}</code>
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Copy
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendComplaint;
