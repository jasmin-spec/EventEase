import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Mail, Phone, MapPin, Send, 
  MessageSquare, HelpCircle, CheckCircle, Loader
} from 'lucide-react';
import API_URL from '../config/api';

export default function ContactSupport() {
  const navigate = useNavigate();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState('idle'); 
  const [loading, setLoading] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const { data } = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setFormData(prevData => ({
          ...prevData,
          name: data.name || '',
          email: data.email || ''
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'subject' || name === 'message') {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await axios.post(`${API_URL}/api/support`, formData);
      
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' }); 
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-100 selection:text-red-900">
      
      {/* Header - Added Backdrop Blur */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <button 
            onClick={() => navigate('/')} 
            className="group flex items-center text-slate-600 hover:text-red-600 font-medium transition-colors duration-200"
          >
            <div className="p-1.5 rounded-full bg-transparent group-hover:bg-red-50 transition-colors mr-2">
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </div>
            Back to Home
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            How can we help?
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Have a question about an event? Need help with your booking? 
            Our team is here to assist you 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
          
          {/* LEFT SIDE: Contact Info & FAQ */}
          <div className="space-y-6 lg:sticky lg:top-24">
            
            {/* Contact Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
              <h3 className="font-bold text-lg mb-6 flex items-center text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                    <MessageSquare className="w-4 h-4 text-red-600" />
                </div>
                Contact Info
              </h3>
              <div className="space-y-5 text-sm text-slate-600">
                <div className="flex items-start group">
                  <Mail className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-500 transition-colors shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Email Us</p>
                    <a href="mailto:support@eventease.com" className="hover:text-red-600 transition-colors">support@eventease.com</a>
                  </div>
                </div>
                <div className="flex items-start group">
                  <Phone className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-500 transition-colors shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Call Us</p>
                    <p>+91 98765 43210</p>
                    <p className="text-xs text-slate-400 mt-1">Mon-Fri, 9am - 6pm</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <MapPin className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-500 transition-colors shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Office</p>
                    <p>Tech Park, Trivandrum, Kerala</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQ Card */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-lg mb-4 flex items-center text-blue-900">
                <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
                Common Questions
              </h3>
              <div className="space-y-4">
                <details className="group cursor-pointer bg-white/60 p-3 rounded-xl border border-blue-100 hover:bg-white transition-colors">
                  <summary className="flex items-center font-medium text-blue-900 list-none justify-between">
                    How do I cancel a booking?
                    <span className="text-blue-400 group-open:rotate-90 transition-transform">▸</span>
                  </summary>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    We would like to respectfully remind you that, in accordance with the terms and conditions agreed to at the time of booking, all payments are final and non-refundable. Our policy does not permit refunds under any circumstances.
                  </p>
                </details>
                <details className="group cursor-pointer bg-white/60 p-3 rounded-xl border border-blue-100 hover:bg-white transition-colors">
                  <summary className="flex items-center font-medium text-blue-900 list-none justify-between">
                    Where is my ticket?
                    <span className="text-blue-400 group-open:rotate-90 transition-transform">▸</span>
                  </summary>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Tickets are available in the "My Bookings" section.
                  </p>
                </details>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader className="w-10 h-10 text-red-600 animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">Retrieving your details...</p>
                </div>
              ) : status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent Successfully!</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Thank you for reaching out. Our support team will review your message and get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Send us a message</h2>
                    <p className="text-slate-500 text-sm mt-1">We typically reply within a few hours.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          readOnly
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed focus:ring-0 select-none"
                          placeholder="Loading..."
                        />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          readOnly
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed focus:ring-0 select-none"
                          placeholder="Loading..."
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all duration-200 bg-white placeholder-slate-400"
                        placeholder="E.g., Issue with booking #1234"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                      <textarea
                        name="message"
                        required
                        rows="6"
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all duration-200 bg-white resize-none placeholder-slate-400"
                        placeholder="Please describe your issue in detail so we can assist you better..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full bg-linear-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center disabled:shadow-none disabled:translate-y-0"
                    >
                      {status === 'sending' ? (
                        <>
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          Send Message <Send className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </button>
                    
                    {status === 'error' && (
                       <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-red-600 text-sm font-medium animate-pulse">
                          Something went wrong. Please try again later.
                       </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}