
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  CheckCircle,
  LogOut,
  MessageSquare,
  X,
  Mail,
  CreditCard,
} from 'lucide-react';
import API_URL from '../../config/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch data for the selected tab
  const fetchData = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/admin');
      return;
    }

    setLoading(true);

    try {
      let endpoint = '';

      if (activeTab === 'users') endpoint = '/api/admin/users';
      if (activeTab === 'organizers') endpoint = '/api/admin/organizers';
      if (activeTab === 'pending') endpoint = '/api/admin/events/pending';
      if (activeTab === 'approved') endpoint = '/api/admin/events/approved';
      if (activeTab === 'support') endpoint = '/api/support';
      if (activeTab === 'payments') endpoint = '/api/admin/bookings';

      const res = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Accept either a direct array or an object containing bookings/data
      const responseData = res.data;
      const records = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.bookings)
          ? responseData.bookings
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

      setData(records);
    } catch (err) {
      console.error('Error fetching admin data:', err);

      if (err.response?.status === 403 || err.response?.status === 401) {
        console.error('Access Denied');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // fetchData depends on the active tab; reload whenever the tab changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Approve event logic
  const approveEvent = async (id) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/api/admin/approve-event/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchData();
    } catch (err) {
      console.error('Error approving event:', err);
    }
  };

  // Unapprove event logic
  const unapproveEvent = async (id) => {
    if (window.confirm('Unapprove this event?')) {
      try {
        const token = localStorage.getItem('token');

        await axios.put(
          `${API_URL}/api/admin/unapprove-event/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert('Event Unapproved!');
        fetchData();
      } catch (err) {
        console.error('Error unapproving event:', err);
      }
    }
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
  };

  const getUserName = (booking) => {
    const user = booking.user;
    if (!user) return 'N/A';
    if (typeof user === 'string') return user;
    return user.name || user.fullName || user.username || user.email || 'N/A';
  };

  const getUserEmail = (booking) => {
    const user = booking.user;
    if (!user || typeof user === 'string') return 'N/A';
    return user.email || 'N/A';
  };

  const getEventTitle = (booking) => {
    const event = booking.event;
    if (!event) return 'N/A';
    if (typeof event === 'string') return event;
    return event.title || event.name || 'N/A';
  };

  const formatAmount = (amount) => {
    const numericAmount = Number(amount);
    return Number.isFinite(numericAmount)
      ? `₹${numericAmount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : 'N/A';
  };

  const tabs = [
    { id: 'pending', label: 'Pending Events', icon: CheckCircle },
    { id: 'approved', label: 'Approved Events', icon: CheckCircle },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'organizers', label: 'Organizers', icon: Briefcase },
    { id: 'support', label: 'Support Tickets', icon: MessageSquare },
    { id: 'payments', label: 'Payment Details', icon: CreditCard },
  ];

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 bg-white border-r border-gray-200 text-gray-700 p-4 lg:p-6 fixed left-0 top-0 h-screen overflow-y-auto z-20">
        <h1 className="text-2xl font-bold mb-8 text-red-600">
          Admin Panel
        </h1>

        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-10 flex items-center gap-3 text-red-500 hover:text-red-600 w-full p-3 border-t border-gray-100 pt-6"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full p-3 sm:p-5 md:ml-64 md:p-6 lg:p-8 overflow-x-hidden min-h-screen">
        {/* Mobile Navigation */}
        <div className="md:hidden bg-white rounded-xl border border-gray-200 shadow-sm p-3 mb-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h1 className="text-xl font-bold text-red-600">
              Admin Panel
            </h1>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-red-600 font-semibold'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Page Heading */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 capitalize break-words">
          {activeTab === 'support'
            ? 'User Support Queries'
            : activeTab === 'payments'
              ? 'Payment Details'
              : `${activeTab} Management`}
        </h2>

        {/* Responsive Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {activeTab === 'support' ? (
                    <>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Sender Details
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Subject
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Message
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Date Received
                      </th>
                    </>
                  ) : activeTab === 'payments' ? (
                    <>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Event
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        User Details
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Payment / Order ID
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Amount
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Tickets
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Status
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Booking Date
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Name / Title
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Email / Details
                      </th>
                      <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 whitespace-nowrap">
                        Status / Location
                      </th>

                      {['pending', 'approved'].includes(activeTab) && (
                        <th className="p-2 sm:p-3 md:p-4 font-semibold text-gray-600 text-right whitespace-nowrap">
                          Action
                        </th>
                      )}
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={
                        activeTab === 'payments'
                          ? 7
                          : activeTab === 'support'
                            ? 4
                            : ['pending', 'approved'].includes(activeTab)
                              ? 4
                              : 3
                      }
                      className="p-8 text-center text-gray-500"
                    >
                      Loading data...
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Support Tickets */}
                      {activeTab === 'support' ? (
                        <>
                          <td className="p-2 sm:p-3 md:p-4 align-top">
                            <div className="flex items-center min-w-[180px]">
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-3 shrink-0">
                                <Mail className="w-4 h-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 break-words">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-500 break-all">
                                  {item.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-2 sm:p-3 md:p-4 font-medium text-gray-800 align-top w-1/5">
                            {item.subject}
                          </td>

                          <td className="p-2 sm:p-3 md:p-4 text-gray-600 align-top max-w-md">
                            <div className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100 min-w-[180px] whitespace-pre-wrap break-words">
                              {item.message}
                            </div>
                          </td>

                          <td className="p-2 sm:p-3 md:p-4 text-sm text-gray-500 whitespace-nowrap align-top">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : 'N/A'}

                            <br />

                            <span className="text-xs text-gray-400">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )
                                : ''}
                            </span>
                          </td>
                        </>
                      ) : activeTab === 'payments' ? (
                        <>
                          <td className="p-2 sm:p-3 md:p-4 font-medium text-gray-900">
                            <p className="min-w-[120px]">
                              {getEventTitle(item)}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {item.event && typeof item.event === 'object'
                                ? item.event.location || ''
                                : ''}
                            </p>
                          </td>

                          <td className="p-2 sm:p-3 md:p-4 text-gray-600">
                            <p className="font-medium text-gray-800">
                              {getUserName(item)}
                            </p>
                            <p className="text-sm text-gray-500 break-all">
                              {getUserEmail(item)}
                            </p>
                          </td>

                          <td className="p-2 sm:p-3 md:p-4 text-gray-600 text-sm">
                            <p>
                              <span className="font-semibold">Payment:</span>{' '}
                              {item.paymentId || 'N/A'}
                            </p>

                            <p className="mt-1">
                              <span className="font-semibold">Order:</span>{' '}
                              {item.orderId || 'N/A'}
                            </p>
                          </td>

                          <td className="p-2 sm:p-3 md:p-4 text-gray-800 font-semibold whitespace-nowrap">
                            {formatAmount(item.amount)}
                          </td>

                          <td className="p-2 sm:p-3 md:p-4 text-gray-600">
                            <p>Qty: {item.quantity ?? 1}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.isVip ? 'VIP' : 'Standard'}
                            </p>
                          </td>

                          <td className="p-2 sm:p-3 md:p-4">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                                String(item.status || '').toLowerCase() ===
                                'confirmed'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-yellow-50 text-yellow-700'
                              }`}
                            >
                              {item.status || 'N/A'}
                            </span>
                          </td>

                          <td className="p-2 sm:p-3 md:p-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(item.createdAt)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-2 sm:p-3 md:p-4 font-medium text-gray-900 break-words">
                            {item.title || item.name}
                          </td>

                          <td className="p-2 sm:p-3 md:p-4 text-gray-600 break-words">
                            {item.email ||
                              (item.price ? `₹${item.price}` : '')}
                          </td>

                          <td className="p-2 sm:p-3 md:p-4 text-gray-600">
                            {item.location || (
                              <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                                Active
                              </span>
                            )}
                          </td>

                          {activeTab === 'pending' && (
                            <td className="p-2 sm:p-3 md:p-4 text-right">
                              <button
                                onClick={() => approveEvent(item._id)}
                                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm whitespace-nowrap"
                              >
                                Approve
                              </button>
                            </td>
                          )}

                          {activeTab === 'approved' && (
                            <td className="p-2 sm:p-3 md:p-4 text-right">
                              <button
                                onClick={() => unapproveEvent(item._id)}
                                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-100 border border-red-200 flex items-center gap-1 ml-auto whitespace-nowrap"
                              >
                                <X className="w-3 h-3" />
                                Unapprove
                              </button>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))
                )}

                {/* Empty State */}
                {!loading && data.length === 0 && (
                  <tr>
                    <td
                      colSpan={
                        activeTab === 'payments'
                          ? 7
                          : activeTab === 'support'
                            ? 4
                            : ['pending', 'approved'].includes(activeTab)
                              ? 4
                              : 3
                      }
                      className="p-8 sm:p-12 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                          {activeTab === 'support' ? (
                            <MessageSquare className="w-6 h-6" />
                          ) : activeTab === 'payments' ? (
                            <CreditCard className="w-6 h-6" />
                          ) : (
                            <Briefcase className="w-6 h-6" />
                          )}
                        </div>

                        <p>
                          {activeTab === 'payments'
                            ? 'No payment records found'
                            : 'No records found'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

