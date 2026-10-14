import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Phone, LogOut, Ticket, ArrowLeft 
} from 'lucide-react';
import API_URL from '../config/api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch User Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const { data } = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Handle Logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/login');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-black font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="font-bold text-lg">My Account</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          
          {/* Cover / Header Gradient */}
          <div className="h-32 bg-linear-to-r from-red-600 to-red-800 relative">
             <button 
                onClick={handleLogout}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center transition"
             >
                <LogOut className="w-3 h-3 mr-2" />
                Logout
             </button>
          </div>

          <div className="px-8 pb-8">
            {/* Avatar - overlapping the header */}
            <div className="relative -mt-16 mb-6">
                <div className="w-32 h-32 bg-white p-1 rounded-full shadow-lg">
                  <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-4xl overflow-hidden">
                    <span className="font-black text-gray-300">
                        {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
            </div>

            {/* User Details Display */}
            <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">{user.name}</h2>
                  <div className="flex items-center text-gray-500 mt-1 mb-6">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </div>

                  {/* Badges / Role */}
                  <div className="flex gap-2">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
                        {user.role || 'User'}
                    </span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-green-100">
                        Active Account
                    </span>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* My Bookings Card */}
            <div 
                onClick={() => navigate('/my-bookings')}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group"
            >
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors">
                    <Ticket className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">My Bookings</h3>
                <p className="text-sm text-gray-500 mt-1">View your tickets and download invoices.</p>
            </div>

            {/* Help / Support Card */}
            <div 
                onClick={() => navigate('/contact-support')}    
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <Phone className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Help & Support</h3>
                <p className="text-sm text-gray-500 mt-1">Need help with an order? Contact us.</p>
            </div>

        </div>

      </main>
    </div>
  );
}