import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader,
  Crown,
  Download,
  Clock,
} from "lucide-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import API_URL from "../../config/api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State to hold the specific booking currently being printed
  const [printTicket, setPrintTicket] = useState(null);

  const navigate = useNavigate();
  const fetchAbortControllerRef = useRef(null);

  //Fetch Data with optimization
  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("❌ No token found in localStorage");
        setError("No authentication token. Please login again.");
        navigate("/login");
        return;
      }

      // Validate token format
      if (!token.startsWith("eyJ")) {
        console.warn(
          "⚠️ Token format looks invalid.",
        );
      }

      // Cancel previous request if it exists
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
      fetchAbortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        const url = `${API_URL}/api/bookings/my-bookings`;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        console.log("📤 Fetching bookings from:", url);
        console.log("📋 Request headers:", {
          Authorization: `Bearer ${token.substring(0, 20)}...`,
          "Content-Type": headers["Content-Type"],
        });

        const { data } = await axios.get(url, {
          headers,
          signal: fetchAbortControllerRef.current.signal,
          timeout: 10000, // 10 second timeout
        });

        console.log("✅ Bookings fetched successfully:", data);

        // Handle both old format (array) and new format (object with bookings and pagination)
        const bookingsArray = Array.isArray(data) ? data : data.bookings || [];
        setBookings(bookingsArray || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("❌ Error fetching bookings:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });

          // If 401 Unauthorized, redirect to login
          if (err.response?.status === 401) {
            console.warn("🔐 Session expired or invalid token");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            navigate("/login");
            setError("Your session has expired. Please login again.");
          } else {
            setError(
              err.response?.data?.message ||
                err.message ||
                "Failed to load bookings",
            );
          }
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchBookings();
    }, 100); 

    return () => {
      clearTimeout(timer);
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, [navigate]);

  //Trigger Download Logic
  // When 'printTicket' state changes, this effect runs to generate the PDF
  useEffect(() => {
    if (printTicket) {
      const generatePDF = async () => {
        try {
          // Wait briefly for React to render the hidden template
          await new Promise((resolve) => setTimeout(resolve, 100));

          const input = document.getElementById("printable-ticket-template");

          if (!input) throw new Error("Template not found");

          const canvas = await html2canvas(input, {
            scale: 2, // High resolution
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
          });

          const imgData = canvas.toDataURL("image/png");

          // A4 dimensions in mm: 210 x 297
          // We want a wide ticket, roughly 210mm wide x 90mm high
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = 190; // 10mm margin on each side
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
          pdf.save(`EventEase-Ticket-${printTicket._id.slice(-6)}.pdf`);
        } catch (err) {
          console.error("PDF Generation Error:", err);
        } finally {
          setPrintTicket(null); 
        }
      };

      generatePDF();
    }
  }, [printTicket]);

  const handleDownload = (booking) => {
    setPrintTicket(booking);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/*HIDDEN PROFESSIONAL TEMPLATE (Only renders during download)*/}
      {printTicket && (
        <div
          id="printable-ticket-template"
          style={{
            position: "fixed",
            top: "-9999px",
            left: "-9999px",
            width: "800px", // Fixed high-res width
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            fontFamily: "sans-serif",
            color: "#1f2937",
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
          }}
        >
          {/* Left Side: Event Details */}
          <div
            style={{
              flex: 2,
              padding: "30px",
              borderRight: "2px dashed #d1d5db",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "900",
                  color: "#dc2626",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                EventEase
              </h1>
              <span
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                CONFIRMED BOOKING
              </span>
            </div>

            {/* Event Title */}
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "800",
                lineHeight: "1.1",
                marginBottom: "15px",
                color: "#111827",
              }}
            >
              {printTicket.event.title}
            </h2>

            {/* Info Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginTop: "30px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  Date
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "600",
                  }}
                >
                  <Calendar
                    size={16}
                    style={{ marginRight: "8px", color: "#dc2626" }}
                  />
                  {new Date(printTicket.event.date).toLocaleDateString(
                    undefined,
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </div>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  Location
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "600",
                  }}
                >
                  <MapPin
                    size={16}
                    style={{ marginRight: "8px", color: "#dc2626" }}
                  />
                  {printTicket.event.location}
                </div>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  Ticket Type
                </p>
                <div style={{ fontWeight: "600", fontSize: "16px" }}>
                  {printTicket.isVip ? "VIP ACCESS" : "GENERAL ADMISSION"}
                </div>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  Attendees
                </p>
                <div style={{ fontWeight: "600", fontSize: "16px" }}>
                  {printTicket.quantity || 1} Person(s)
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: "40px",
                paddingTop: "20px",
                borderTop: "1px solid #f3f4f6",
                fontSize: "10px",
                color: "#9ca3af",
              }}
            >
              <p>
                Booking ID:{" "}
                <span style={{ fontFamily: "monospace", color: "#374151" }}>
                  {printTicket.paymentId}
                </span>
              </p>
              <p style={{ marginTop: "4px" }}>
                Please present this QR code at the entrance for verification.
              </p>
            </div>
          </div>

          {/* Right Side: QR Code & Price (Tear-off look) */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#f9fafb",
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                padding: "10px",
                backgroundColor: "white",
                borderRadius: "10px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              <QRCode
                value={JSON.stringify({ id: printTicket._id, status: "valid" })}
                size={120}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <p
                style={{
                  fontSize: "10px",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                Total Paid
              </p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "900",
                  color: "#111827",
                }}
              >
                ₹{printTicket.amount}
              </p>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "20px" }}>
              <img
                src="/logo.png"
                alt=""
                style={{ height: "24px", opacity: 0.5 }}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          </div>
        </div>
      )}
      {/* ---------------------------------------------------------------- */}

      {/* VISIBLE UI */}
      <div className="bg-white sticky top-0 z-10 shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="text-gray-600 hover:text-black transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">My Tickets</h1>
          <div className="w-6"></div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900">
              No Tickets Found
            </h2>
            <button
              onClick={() => navigate("/home")}
              className="mt-6 bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition"
            >
              Book an Event
            </button>
          </div>
        ) : (
          bookings.map((booking) => {
            const eventDate = new Date(booking.event?.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            eventDate.setHours(0, 0, 0, 0);
            const isExpired = eventDate < today;
            const ticketCount = booking.quantity || 1;

            // Standard Colors for UI 
            return (
              <div className="relative group" key={booking._id}>
                {/* UI CARD (For Screen Only)*/}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col sm:flex-row border border-gray-100">
                  <div
                    className={`sm:w-1/3 h-48 sm:h-auto relative bg-gray-200 ${isExpired ? "grayscale" : ""}`}
                  >
                    {booking.event?.coverImage ? (
                      <img
                        src={booking.event.coverImage}
                        alt={booking.event?.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h2
                          className={`text-xl font-black line-clamp-1 ${isExpired ? "text-gray-500" : "text-gray-900"}`}
                        >
                          {booking.event?.title}
                        </h2>

                        <div className="flex items-center gap-2">
                          {booking.isVip && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center border border-amber-300">
                              <Crown className="w-3 h-3 mr-1 fill-amber-600" />{" "}
                              VIP
                            </span>
                          )}
                          {isExpired ? (
                            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center border border-gray-200">
                              <XCircle className="w-3 h-3 mr-1" /> EXPIRED
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center border border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" /> VALID
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-500 mt-2">
                        <div className="flex items-center">
                          <Calendar
                            className={`w-4 h-4 mr-2 ${isExpired ? "text-gray-400" : "text-red-500"}`}
                          />
                          {booking.event?.date?.split("T")[0]}
                        </div>
                        <div className="flex items-center">
                          <MapPin
                            className={`w-4 h-4 mr-2 ${isExpired ? "text-gray-400" : "text-red-500"}`}
                          />
                          {booking.event?.location}
                        </div>
                        <div className="flex items-center">
                          <Ticket
                            className={`w-4 h-4 mr-2 ${isExpired ? "text-gray-400" : "text-red-500"}`}
                          />
                          <span className="font-semibold text-gray-700">
                            {ticketCount}{" "}
                            {ticketCount > 1 ? "Tickets" : "Ticket"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-dashed border-gray-200 flex justify-between items-end">
                      <div
                        className={`bg-white p-2 border border-gray-100 rounded-lg shadow-sm ${isExpired ? "opacity-30 grayscale" : ""}`}
                      >
                        <QRCode value={booking._id} size={64} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          Total Paid
                        </p>
                        <p
                          className={`text-2xl font-black ${isExpired ? "text-gray-400 line-through" : "text-gray-900"}`}
                        >
                          ₹{booking.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/*DOWNLOAD BUTTON*/}
                <div className="flex justify-end mt-3 mb-8">
                  <button
                    onClick={() => handleDownload(booking)}
                    disabled={printTicket !== null}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {printTicket?._id === booking._id ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" /> Generating
                        Ticket...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Download PDF Ticket
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}