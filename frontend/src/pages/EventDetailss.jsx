import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Calendar, MapPin, Ticket, ShieldCheck, 
  Heart, Clock, Info, CheckCircle, Minus, Plus, Crown, Tag, Loader2 
} from 'lucide-react';
import API_URL from '../config/api';

// Function to decode JWT 
const extractUserIdFromToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const decoded = JSON.parse(jsonPayload);
    return decoded.id; 
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  //PAYMENT VERIFICATION 
  const [isVerifying, setIsVerifying] = useState(false);

  // Interest State
  const [isInterested, setIsInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(0);

  // Ticket & Pricing State
  const [ticketCount, setTicketCount] = useState(1);
  const [isVip, setIsVip] = useState(false);
  
  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Sample promo codes
  const VALID_PROMO_CODES = {
    'SAVE10': 10,      // 10% discount
    'SAVE20': 20,      // 20% discount
    'EARLYBIRD': 15,   // 15% discount
    'SPECIAL5': 5,      // 5% discount
    'FRIEND50': 50,    // ₹50 flat discount
    'NEWUSER': 25,     // 25% discount
  };

  // Fetch Event Data & Verify Interest
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/events/single/${id}`);
        setEvent(data);
        
        const count = data.likes ? data.likes.length : 0;
        setInterestCount(count);

        const token = localStorage.getItem('token');
        let userId = localStorage.getItem('userId');
        
        if (token && !userId) {
          userId = extractUserIdFromToken(token);
          if (userId) localStorage.setItem('userId', userId);
        }
        
        if (token && userId && data.likes && Array.isArray(data.likes)) {
          const isUserLiked = data.likes.some(likeId => String(likeId) === String(userId));
          setIsInterested(isUserLiked);
        } else {
          setIsInterested(false);
        }

      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // TICKET HANDLERS
  const incrementTickets = () => {
    if (event && ticketCount < event.availableTickets) {
      setTicketCount(prev => prev + 1);
    }
  };

  const decrementTickets = () => {
    if (ticketCount > 1) {
      setTicketCount(prev => prev - 1);
    }
  };

  //PROMO CODE HANDLER
  const applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase();
    
    if (!code) {
      setPromoMessage('Please enter a promo code');
      setPromoDiscount(0);
      setPromoApplied(false);
      return;
    }

    if (VALID_PROMO_CODES[code] !== undefined) {
      const discountValue = VALID_PROMO_CODES[code];
      setPromoDiscount(discountValue);
      setPromoApplied(true);
      setPromoMessage(`✅ Promo code applied! ${discountValue}${discountValue >= 100 ? ' flat' : '%'} off`);
    } else {
      setPromoDiscount(0);
      setPromoApplied(false);
      setPromoMessage('❌ Invalid promo code');
    }
  };

  //CALCULATE FINAL PRICE
  const calculateFinalPrice = () => {
    let basePrice = event.price * ticketCount;
    if (isVip) {
      basePrice += 500;
    }

    let discount = 0;
    if (promoApplied) {
      if (promoDiscount >= 100) {
        discount = promoDiscount; // Flat discount
      } else {
        discount = Math.floor((basePrice * promoDiscount) / 100); // Percentage discount
      }
    }

    return Math.max(0, basePrice - discount);
  };

  //INTEREST HANDLER
  const handleInterest = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const previousState = isInterested;
    const previousCount = interestCount;

    setIsInterested(!previousState);
    setInterestCount(prev => previousState ? prev - 1 : prev + 1);

    try {
      const { data } = await axios.put(
        `${API_URL}/api/events/interest/${event._id}`,
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.isLiked !== undefined) setIsInterested(data.isLiked);
      if (data.likeCount !== undefined) setInterestCount(data.likeCount);
      
    } catch (error) {
      console.error("Failed to update interest:", error);
      setIsInterested(previousState);
      setInterestCount(previousCount);
    }
  };

  //PAYMENT HANDLER
  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      // Verify Token
      try {
        await axios.get(`${API_URL}/api/users/check-user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (tokenError) {
        console.error('Session expired:', tokenError);
        localStorage.removeItem('token');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      
      // Calculate Amount
      const totalAmount = calculateFinalPrice();
      
      // Calculate Discount Amount for Backend Record
      let basePrice = event.price * ticketCount;
      if (isVip) basePrice += 500;
      let discountAmount = 0;
      if (promoApplied) {
        if (promoDiscount >= 100) discountAmount = promoDiscount;
        else discountAmount = Math.floor((basePrice * promoDiscount) / 100);
      }

      // Create Order
      const orderResponse = await axios.post(
        `${API_URL}/api/payments/order`,
        { 
          amount: totalAmount,
          eventId: event._id,
          quantity: ticketCount,
          promoCode: promoApplied ? promoCode : '',
          discount: discountAmount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const order = orderResponse.data;

      // Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "EventEase",
        description: `Booking ${ticketCount} ticket(s) for ${event.title}`,
        order_id: order.id,
        handler: async (response) => {
          //START LOADING SCREEN
          setIsVerifying(true);

          try {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: event._id,
              amount: totalAmount,
              quantity: ticketCount,
              isVip: isVip,
              promoCode: promoApplied ? promoCode : '',
              discount: discountAmount
            };

            const verifyResponse = await axios.post(
              `${API_URL}/api/payments/verify`,
              verifyData,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // SUCCESS: Redirect
            console.log("Verify success:", verifyResponse.data);
            navigate('/my-bookings', { replace: true });

          } catch (error) {
            console.error("Verification error:", error);
            // SAFETY FALLBACK: Redirect anyway because money was likely deducted
            navigate('/my-bookings', { replace: true });
          } finally {
             // In case navigation fails for some reason
             setIsVerifying(false);
          }
        },
        modal: {
            ondismiss: function() {
                setIsVerifying(false); 
            }
        },
        theme: { color: "#dc2626" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Could not initiate payment. Please try again.");
      setIsVerifying(false);
    }
  };

  // FULL SCREEN LOADING: VERIFYING PAYMENT
  if (isVerifying) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm z-50 fixed inset-0">
      <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500">
        <div className="relative">
           <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
           <div className="relative bg-white p-4 rounded-full shadow-xl border-2 border-green-100">
             <ShieldCheck className="w-12 h-12 text-green-600 animate-pulse" />
           </div>
        </div>
        <div className="text-center space-y-2">
           <h3 className="text-2xl font-bold text-gray-900">Verifying Payment</h3>
           <p className="text-gray-500 max-w-xs mx-auto">Please wait while we confirm your booking and send your tickets...</p>
        </div>
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    </div>
  );

  // INITIAL LOADING
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading Event...</p>
      </div>
    </div>
  );

  // NOT FOUND
  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
        <p className="text-gray-500 mb-6">The event you are looking for might have been removed.</p>
        <button 
          onClick={() => navigate('/')} 
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24 lg:pb-12">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group p-2 -ml-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="text-sm font-semibold text-gray-400 hidden sm:block">
            Event Details
          </div>

          {!localStorage.getItem('token') && (
             <button 
               onClick={() => navigate('/login', { state: { from: location.pathname } })}
               className="text-sm font-semibold text-red-600 px-4 py-2 rounded-full hover:bg-red-50 transition-colors"
             >
               Sign In
             </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Image Section */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-video lg:aspect-21/9 bg-gray-200 group">
              <img 
                src={event.coverImage} 
                alt={event.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center gap-1.5">
                <Heart className={`w-4 h-4 ${isInterested ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                {interestCount} Interested
              </div>
            </div>

            {/* Title & Key Details Mobile */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col gap-4 mb-8">
                <span className="inline-block w-fit px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                  Featured Event
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                  {event.title}
                </h1>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Date</p>
                    <p className="text-gray-900 font-semibold mt-0.5">
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: 'short', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Location</p>
                    <p className="text-gray-900 font-semibold mt-0.5 truncate max-w-37.5">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Availability</p>
                    <p className="text-gray-900 font-semibold mt-0.5">
                      {event.availableTickets > 0 ? `${event.availableTickets} Seats Left` : 'Sold Out'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About this Event</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Pricing & Action */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              
              {/* DESKTOP PRICING CARD */}
              <div className="hidden lg:block bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 p-6 text-white text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-gray-800 to-black opacity-50"></div>
                  <div className="relative z-10">
                    <p className="text-sm text-gray-300 font-medium uppercase tracking-widest mb-1">Total Price</p>
                    <div className="flex items-baseline justify-center gap-1">
                      {/* DYNAMIC TOTAL PRICE WITH DISCOUNT */}
                      <span className="text-4xl font-black">₹{calculateFinalPrice()}</span>
                    </div>
                    {/* Shows unit price calculation with discount breakdown */}
                    <p className="text-xs text-gray-400 mt-1">
                       (₹{event.price} × {ticketCount} tickets{isVip ? ' + ₹500 VIP' : ''}{promoApplied ? ` - ₹${Math.floor((event.price * ticketCount + (isVip ? 500 : 0)) * promoDiscount / 100) || promoDiscount} OFF` : ''})
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  
                  {/*NUMBER OF TICKETS SELECTOR*/}
                  <div className="mb-8">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-3">
                        Number of Tickets
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <button 
                            onClick={decrementTickets}
                            disabled={ticketCount <= 1}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="text-xl font-bold text-gray-900 w-12 text-center">
                            {ticketCount}
                        </span>

                        <button 
                            onClick={incrementTickets}
                            disabled={ticketCount >= event.availableTickets}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                  {/* --------------------------------- */}

                  {/* VIP TICKET OPTION */}
                  <div className="mb-8 p-4 rounded-xl border-2 bg-linear-to-br from-amber-50 to-yellow-50 border-amber-200 cursor-pointer hover:shadow-md transition-all" onClick={() => setIsVip(!isVip)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Crown className={`w-5 h-5 ${isVip ? 'text-amber-600 fill-amber-600' : 'text-amber-500'}`} />
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-900">VIP Ticket</p>
                          <p className="text-xs text-gray-600">Premium Experience +₹500</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isVip} 
                        onChange={() => setIsVip(!isVip)}
                        className="w-5 h-5 accent-amber-600 cursor-pointer"
                      />
                    </div>
                  </div>
                  {/* --------------------------------- */}

                  {/* PROMO CODE SECTION */}
                  <div className="mb-8 p-4 rounded-xl border border-gray-200 bg-blue-50 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-blue-600" />
                      <label className="text-sm font-bold text-gray-900">Promo Code</label>
                    </div>
                    
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      />
                      <button 
                        onClick={applyPromoCode}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors"
                      >
                        Apply
                      </button>
                    </div>

                    {promoMessage && (
                      <p className={`text-xs font-semibold ${promoApplied ? 'text-green-700' : 'text-red-700'}`}>
                        {promoMessage}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 font-medium">Sample codes: SAVE10, SAVE20, SPECIAL5</p>
                    </div>
                  </div>
                  {/* --------------------------------- */}

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Secure payment via Razorpay</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                      <span>Instant confirmation</span>
                    </div>
                  </div>

                  <button 
                    onClick={handlePayment}
                    disabled={event.availableTickets <= 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] 
                      ${event.availableTickets > 0 
                        ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-500/30' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    {event.availableTickets > 0 ? `Book ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}` : 'Sold Out'}
                  </button>

                  <p className="text-xs text-center text-gray-400 mt-4">
                    By booking, you agree to our Terms & Conditions.
                  </p>
                </div>
              </div>

              {/* Support Contact */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">Have questions?</p>
                  <p className="text-xs text-gray-500 mt-1">Contact the organizer</p>
                </div>
                <Link
                  to="/contact-support"
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Contact
                </Link>
              </div>

              {/* INTERESTED BUTTON */}
              <div className="bg-pink-50 rounded-2xl p-5 border border-pink-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Interested?</p>
                        <p className="text-xs text-gray-500 mt-1">Save it for later</p>
                      </div>
                      <Heart className={`w-6 h-6 ${isInterested ? "fill-pink-500 text-pink-500" : "text-gray-400"}`} />
                  </div>
                  
                  <button
                      onClick={handleInterest}
                      className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 border
                        ${isInterested 
                          ? 'bg-pink-600 text-white border-pink-600 hover:bg-pink-700 shadow-md shadow-pink-200' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:text-pink-600'
                        }`}
                  >
                      {isInterested ? (
                          <span className="flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4" /> Already Liked
                          </span>
                      ) : (
                          "Mark as Interested"
                      )}
                  </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/*MOBILE STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        
        {/* Mobile Ticket Selector Row */}
        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
           <span className="text-xs font-bold text-gray-500 uppercase">Tickets:</span>
           <div className="flex items-center gap-3">
              <button onClick={decrementTickets} disabled={ticketCount <= 1} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 disabled:opacity-50"><Minus className="w-3 h-3"/></button>
              <span className="font-bold text-gray-900">{ticketCount}</span>
              <button onClick={incrementTickets} disabled={ticketCount >= event.availableTickets} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 disabled:opacity-50"><Plus className="w-3 h-3"/></button>
           </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Total</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">₹{calculateFinalPrice()}</span>
            </div>
          </div>
          <button 
            onClick={handlePayment}
            disabled={event.availableTickets <= 0}
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 
              ${event.availableTickets > 0 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {event.availableTickets > 0 ? 'Book Now' : 'Sold Out'}
          </button>
        </div>
      </div>

    </div>
  );
}