import { useState } from 'react'; // Import useState hook to manage form state
import axios from 'axios'; // Import Axios for HTTP requests
import { useNavigate, Link } from 'react-router-dom'; // useNavigate for redirects, Link for client-side navigation
import API_URL from '../config/api';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '', // User full name
    email: '', // User email
    password: '', // User password
    role: 'user', // Default role is 'user'
  });

  const [isLoading, setIsLoading] = useState(false); // State for loading feedback
  const navigate = useNavigate(); // Initialize navigation hook

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submit (page reload)
    setIsLoading(true); // Start loading animation

    try {
      await axios.post(`${API_URL}/api/users/signup`, formData); // Send signup data to backend
      
      navigate('/login'); // Redirect to login page
    } catch (err) {
      console.error(err.response?.data?.message || "Error during signup"); // Show backend error or fallback text
    } finally {
        setIsLoading(false); // Stop loading animation
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: "url('poster bg login.jpg')" }} // Background image
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div> {/* Semi-transparent dark overlay */}

      {/* Back Button (Floating Top Left) */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 z-10 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
          <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
        </svg>
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Form Card */}
      <div className="relative bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2> {/* Heading */}
            <p className="text-sm text-gray-500 mt-2">Join EventEase Today</p> {/* Subtitle */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5"> {/* Form with submit handler */}

          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <input
                type="text" // Text input for name
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none sm:text-sm"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} // Update name in state
                required // Make field mandatory
                />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Gmail)</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                </div>
                <input
                type="email" // Email input
                placeholder="Enter your email id"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none sm:text-sm"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} // Update email in state
                required
                />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                type="password" // Password input
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all outline-none sm:text-sm"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} // Update password in state
                required
                />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am an:</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                </div>
                <select
                value={formData.role} // Controlled select bound to role
                onChange={(e) => setFormData({ ...formData, role: e.target.value })} // Update role in state
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-black transition-all outline-none sm:text-sm appearance-none"
                >
                <option value="user">User</option> {/* Normal attendee */}
                <option value="organizer">Organizer</option> {/* Event organizer role */}
                </select>
                {/* Custom Chevron Icon for Select */}
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>

          <button
            type="submit" // Submit button
            disabled={isLoading}
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
               // Loading spinner
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : 'Register'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?
          <Link to="/login" className="text-black font-bold hover:underline ml-1">
            Login {/* Link to login route */}
          </Link>
        </p>
      </div>
    </div>
  );
}