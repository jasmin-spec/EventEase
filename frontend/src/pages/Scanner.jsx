import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowLeft, Camera } from 'lucide-react';
import API_URL from '../config/api';

export default function TicketScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle the QR Scan
  const handleScan = async (result) => {
    if (result && result[0]?.rawValue) {
      // Prevent multiple scans while loading
      if (loading) return; 
      
      let ticketId = result[0].rawValue;

      // Try to parse JSON if the QR contains a JSON object
      try {
        const data = JSON.parse(ticketId);
        if (data.id) ticketId = data.id;
      } catch (e) {
        // It's just a plain string ID, continue
      }

      verifyTicket(ticketId);
    }
  };

  // Call Backend to Verify
  const verifyTicket = async (ticketId) => {
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const token = localStorage.getItem('token');
      
      const { data } = await axios.get(`${API_URL}/api/bookings/verify/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setScanResult(data.booking);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid Ticket or Server Error");
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans">
      
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-8 mt-2">
        <button onClick={() => navigate('/organizer-dashboard')} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Ticket Validator</h1>
        <div className="w-9"></div> {/* Spacer */}
      </div>

      {/* Camera / Status Area */}
      <div className="w-full max-w-md relative">
        
        {/* 1. CAMERA VIEW (Only show when no result) */}
        {!scanResult && !error && (
          <div className="aspect-square bg-gray-900 rounded-3xl overflow-hidden border-2 border-gray-700 relative shadow-2xl">
             {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                   <Loader className="w-12 h-12 text-red-500 animate-spin mb-4" />
                   <p className="font-bold text-gray-300">Verifying...</p>
                </div>
             ) : (
                <Scanner 
                    onScan={handleScan} 
                    components={{ audio: false, torch: true }}
                    styles={{ container: { width: '100%', height: '100%' } }}
                />
             )}
             
             {/* Overlay Frame */}
             <div className="absolute inset-0 border-40 border-black/50 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-red-500/50 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-500 -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-500 -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-500 -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-500 -mb-1 -mr-1"></div>
                </div>
             </div>
          </div>
        )}

        {/* 2. SUCCESS RESULT CARD */}
        {scanResult && (
          <div className="bg-white text-gray-900 rounded-3xl p-8 animate-slideUp shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-black text-green-700 mb-1">Access Granted</h2>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-6">Valid Ticket</p>
            
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3 mb-6">
               <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Guest</p>
                  <p className="font-bold text-lg">{scanResult.guestName}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Event</p>
                  <p className="font-medium text-gray-800">{scanResult.eventName}</p>
               </div>
               <div className="flex justify-between items-center pt-2">
                  <span className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold">
                    🎟 {scanResult.quantity} Ticket(s)
                  </span>
                  {scanResult.isVip && (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-sm font-bold border border-amber-200">
                      VIP
                    </span>
                  )}
               </div>
            </div>

            <button 
              onClick={resetScanner} 
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition active:scale-95"
            >
              Scan Next Ticket
            </button>
          </div>
        )}

        {/* 3. ERROR RESULT CARD */}
        {error && (
          <div className="bg-white text-gray-900 rounded-3xl p-8 animate-slideUp shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-black text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-500 font-medium mb-8">{error}</p>
            
            <button 
              onClick={resetScanner} 
              className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Helper Text */}
        {!scanResult && !error && (
          <p className="text-center text-gray-500 mt-6 flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" /> Point camera at QR Code
          </p>
        )}

      </div>
    </div>
  );
}