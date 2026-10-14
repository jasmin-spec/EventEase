
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Loader,
  TrendingUp,
  Users,
  Ticket,
  Edit,
  Plus,
  ScanLine,
  LogOut,
} from 'lucide-react';
import API_URL from '../../config/api';

export default function OrganizerDashboard() {
  const [myEvents, setMyEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState('all');

  const [stats, setStats] = useState({
    totalProfit: 0,
    ticketsSold: 0,
    remaining: 0,
  });

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // ==============================
  // FILTER EVENTS
  // ==============================
  const filteredEvents = myEvents.filter((event) => {
    if (eventFilter === 'live') {
      return event.isApproved === true;
    }

    if (eventFilter === 'pending') {
      return event.isApproved === false;
    }

    return true;
  });

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // ==============================
  // FETCH ORGANIZER DATA
  // ==============================
  const fetchMyData = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await axios.get(
        `${API_URL}/api/events/my-events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMyEvents(data);

      // ==============================
      // CALCULATE STATS
      // ==============================
      const calculatedStats = data.reduce(
        (acc, event) => {
          const price = Number(event.price) || 0;

          const total =
            Number(event.totalTickets) ||
            Number(event.availableTickets) ||
            0;

          const available =
            Number(event.availableTickets) || 0;

          const soldCount = total - available;
          const profit = soldCount * price;

          return {
            totalProfit: acc.totalProfit + profit,
            ticketsSold: acc.ticketsSold + soldCount,
            remaining: acc.remaining + available,
          };
        },
        {
          totalProfit: 0,
          ticketsSold: 0,
          remaining: 0,
        }
      );

      setStats(calculatedStats);
    } catch (err) {
      console.error(
        'Dashboard Error:',
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // LOAD DATA
  // ==============================
  useEffect(() => {
    fetchMyData();
  }, []);

  // ==============================
  // LOADING SCREEN
  // ==============================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-gray-500" />
      </div>
    );
  }

  // ==============================
  // DASHBOARD
  // ==============================
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-12 font-sans">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 md:mb-10 gap-5">

        <div className="w-full lg:w-auto min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Organizer Dashboard
          </h1>

          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Track your sales, profit, and event performance.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">

          {/* SCANNER BUTTON */}
          <button
            onClick={() => navigate('/scanner')}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 px-3 sm:px-5 py-3 rounded-full text-sm sm:text-base font-bold hover:bg-gray-50 transition shadow-sm active:scale-95 whitespace-nowrap"
          >
            <ScanLine className="w-5 h-5 shrink-0" />
            Scan Tickets
          </button>

          {/* CREATE EVENT BUTTON */}
          <button
            onClick={() => navigate('/create-event')}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-black text-white px-3 sm:px-5 py-3 rounded-full text-sm sm:text-base font-bold hover:bg-gray-800 transition shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5 shrink-0" />
            Create Event
          </button>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 px-3 sm:px-5 py-3 rounded-full text-sm sm:text-base font-bold hover:bg-gray-50 transition shadow-sm active:scale-95 whitespace-nowrap"
            title="Logout"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Logout
          </button>

        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 md:mb-12 max-w-7xl mx-auto">

        {/* TOTAL REVENUE */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4 hover:shadow-md transition min-w-0">

          <div className="p-3 sm:p-4 bg-green-50 rounded-2xl shrink-0">
            <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
          </div>

          <div className="min-w-0">
            <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
              Total Revenue
            </p>

            <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 break-words">
              ₹{stats.totalProfit.toLocaleString()}
            </p>
          </div>

        </div>

        {/* TICKETS SOLD */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4 hover:shadow-md transition min-w-0">

          <div className="p-3 sm:p-4 bg-blue-50 rounded-2xl shrink-0">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
          </div>

          <div className="min-w-0">
            <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
              Tickets Sold
            </p>

            <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {stats.ticketsSold}
            </p>
          </div>

        </div>

        {/* AVAILABLE TICKETS */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4 hover:shadow-md transition min-w-0 sm:col-span-2 lg:col-span-1">

          <div className="p-3 sm:p-4 bg-orange-50 rounded-2xl shrink-0">
            <Ticket className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />
          </div>

          <div className="min-w-0">
            <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
              Available
            </p>

            <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {stats.remaining}
            </p>
          </div>

        </div>

      </div>

      {/* EVENTS TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* TABLE HEADER */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between lg:items-center gap-4">

          <h2 className="text-xl font-bold text-gray-800">
            Your Events
          </h2>

          {/* EVENT STATUS FILTER */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">

            <button
              onClick={() => setEventFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                eventFilter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Events ({myEvents.length})
            </button>

            <button
              onClick={() => setEventFilter('live')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                eventFilter === 'live'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Live ({myEvents.filter(
                (event) => event.isApproved === true
              ).length})
            </button>

            <button
              onClick={() => setEventFilter('pending')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                eventFilter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending ({myEvents.filter(
                (event) => event.isApproved === false
              ).length})
            </button>

          </div>
        </div>

        {/* TABLE */}
        <div className="w-full overflow-x-auto">

          <table className="w-full min-w-[650px] text-left">

            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">

              <tr>
                <th className="p-3 sm:p-5">Event Name</th>
                <th className="p-3 sm:p-5">Price</th>
                <th className="p-3 sm:p-5">Sold / Total</th>
                <th className="p-3 sm:p-5">Status</th>
                <th className="p-3 sm:p-5 text-right">Action</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {/* NO EVENTS MATCH FILTER */}
              {filteredEvents.length === 0 ? (

                <tr>
                  <td
                    colSpan={5}
                    className="p-6 sm:p-10 text-center text-gray-400 font-medium"
                  >
                    {myEvents.length === 0
                      ? 'No events found. Start by creating one!'
                      : eventFilter === 'live'
                      ? 'No live events found.'
                      : eventFilter === 'pending'
                      ? 'No pending events found.'
                      : 'No events found.'}
                  </td>
                </tr>

              ) : (

                /* FILTERED EVENTS */
                filteredEvents.map((event) => {

                  const total =
                    Number(event.totalTickets) ||
                    Number(event.availableTickets) ||
                    0;

                  const available =
                    Number(event.availableTickets) || 0;

                  const sold = total - available;

                  // Prevent invalid progress percentage
                  const progress =
                    total > 0
                      ? Math.min((sold / total) * 100, 100)
                      : 0;

                  return (
                    <tr
                      key={event._id}
                      className="hover:bg-gray-50 transition group"
                    >

                      {/* EVENT NAME */}
                      <td className="p-3 sm:p-5">
                        <div className="font-bold text-gray-900 break-words">
                          {event.title}
                        </div>

                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </td>

                      {/* PRICE */}
                      <td className="p-3 sm:p-5 font-medium text-gray-700 whitespace-nowrap">
                        ₹{event.price}
                      </td>

                      {/* SOLD / TOTAL */}
                      <td className="p-3 sm:p-5">

                        <div className="flex items-center gap-2">

                          <div className="w-16 sm:w-24 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">

                            <div
                              className="h-full bg-black rounded-full"
                              style={{
                                width: `${progress}%`,
                              }}
                            />

                          </div>

                          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                            {sold} / {total}
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}
                      <td className="p-3 sm:p-5">

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
                            event.isApproved
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {event.isApproved
                            ? 'Live'
                            : 'Pending'}
                        </span>

                      </td>

                      {/* EDIT */}
                      <td className="p-3 sm:p-5 text-right">

                        <button
                          onClick={() =>
                            navigate(`/edit-event/${event._id}`)
                          }
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-black hover:text-white transition"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
