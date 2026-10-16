//Import dependencies
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Search, LogOut, User, ArrowUpDown, LoaderCircle } from 'lucide-react';
import API_URL from '../config/api';
import Footer from './Footer.jsx';
import {
  LayoutGrid,
  CalendarDays,
  Drama,
  Trophy,
  Music2,
  GraduationCap,
  Sparkles,
} from "lucide-react";



//HERO SKELETON
function HeroImageSkeleton() {
  return (
    <div className="absolute inset-0 bg-gray-200 animate-pulse">
      <div className="h-full w-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

//EVENT CARD (Text shows instantly, Image loads gracefully)
function EventCard({ event }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if event is expired
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const isExpired = eventDate < today;

  return (
    <div className={`group relative flex flex-col h-full bg-white rounded-2xl md:rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 border border-gray-100 hover:-translate-y-2 overflow-hidden cursor-pointer active:scale-98 ${isExpired ? 'opacity-60' : ''}`}>
      <Link to={`/event/${event._id}`} className="flex flex-col h-full">

        {/* IMAGE CONTAINER */}
        <div className={`relative w-full aspect-4/5 overflow-hidden bg-gray-100 ${isExpired ? 'grayscale' : ''}`}>

          {/* Skeleton Overlay: Visible until imageLoaded is true */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
          )}

          {/* Actual Image */}
          <img
            src={event.coverImage}
            alt={event.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transform transition-all duration-700 ease-in-out group-hover:scale-110
              ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}
            `}
          />

          {/* Tag */}
          <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
            <div className={`${isExpired ? 'bg-gray-400/90 text-gray-100' : 'bg-white/90 text-gray-900'} backdrop-blur-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-wider shadow-lg`}>
              {isExpired ? 'Expired' : (event.category || "Event")}
            </div>
          </div>

          {/* Hover Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
        </div>

        {/* CONTENT (Visible Immediately) */}
        <div className="p-3 md:p-5 flex-1 flex flex-col">
          <div className="flex-1 space-y-1 md:space-y-2">
            <h3 className={`font-bold text-sm md:text-lg leading-tight line-clamp-2 group-hover:text-rose-600 transition-colors duration-300 ${isExpired ? 'text-gray-500' : 'text-gray-900'}`}>
              {event.title}
            </h3>
            <p className="text-gray-500 text-[10px] md:text-xs font-medium line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="mt-3 md:mt-4 pt-2 md:pt-4 border-t border-gray-50">
            <div>
              <p className="text-gray-400 text-[8px] md:text-[10px] font-bold uppercase tracking-wider">
                {isExpired ? 'Event Ended' : 'Starting'}
              </p>
              <p className={`font-black text-base md:text-xl tracking-tight ${isExpired ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                ₹{event.price}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// --- 3. GLOBAL LOADING STATE (For initial API fetch only) ---
function GlobalLoadingSkeleton() {
  return (
    <div className="space-y-3 p-3 md:p-4 rounded-3xl bg-white shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="aspect-4/5 w-full rounded-2xl bg-gray-200 animate-pulse" />
      <div className="space-y-2 mt-4 flex-1">
        <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-full w-full animate-pulse" />
      </div>
    </div>
  );
}
// EVENT LOADING SPINNER
function EventLoadingSpinner() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16">
      <LoaderCircle className="w-12 h-12 text-rose-500 animate-spin" />
      <p className="mt-4 text-sm font-semibold text-gray-500">
        Loading events...
      </p>
    </div>
  );
}

//NO EVENTS STATE
function NoEventsState({ resetFilters }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 md:py-24 text-center px-4">
      <div className="relative group">
        <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-white shadow-xl flex items-center justify-center mb-6 border border-gray-100">
          <span className="text-4xl md:text-6xl transform group-hover:scale-110 transition-transform duration-300">🎭</span>
        </div>
      </div>
      <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">No events found</h3>
      <p className="text-gray-500 mt-3 max-w-md text-base md:text-lg">
        We couldn't find any events matching your search.
      </p>
      <button
        onClick={resetFilters}
        className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black hover:shadow-lg hover:shadow-gray-400/30 transform hover:-translate-y-1 transition-all duration-300 w-full md:w-auto"
      >
        Clear Filters
      </button>
    </div>
  );
}

// MAIN HOME COMPONENT
export default function Home() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true); //API fetch

  // Hero Image State
  const [heroLoaded, setHeroLoaded] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentSlide, setCurrentSlide] = useState(0);
  //Sorting
  const [sortBy, setSortBy] = useState("date-soon"); // Default : sort by : Soonest events first

  const navigate = useNavigate();
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchApprovedEvents = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/events`);
        const approved = data.filter(event => event.isApproved === true);
        setEvents(approved);
        setFilteredEvents(approved);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedEvents();
  }, []);

  //FILTERING & SORTING LOGIC
  useEffect(() => {
    // 1. Filter by Search & Category
    let result = events;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(event =>
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter(event =>
        event.category && event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    //Sort Logic
    const sortedResult = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "date-soon":
          return new Date(a.date) - new Date(b.date);
        case "date-later":
          return new Date(b.date) - new Date(a.date);
        default:
          return 0;
      }
    });

    setFilteredEvents(sortedResult);
  }, [searchQuery, selectedCategory, sortBy, events]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
  };

  const categories = ["All", "Events", "Plays", "Sports", "Music", "Workshop", "Activities"];
  const categoryIcons = {
    All: {
      Icon: LayoutGrid,
      color: "text-violet-400",
    },
    Events: {
      Icon: CalendarDays,
      color: "text-sky-400",
    },
    Plays: {
      Icon: Drama,
      color: "text-pink-400",
    },
    Sports: {
      Icon: Trophy,
      color: "text-amber-400",
    },
    Music: {
      Icon: Music2,
      color: "text-fuchsia-400",
    },
    Workshop: {
      Icon: GraduationCap,
      color: "text-emerald-400",
    },
    Activities: {
      Icon: Sparkles,
      color: "text-orange-400",
    },
  };


  return (
    <div className="bg-gray-50 min-h-screen font-sans selection:bg-rose-500 selection:text-white pb-20 md:pb-0">

      {/* HEADER BAR */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">

            {/* Logo */}
            <h1
              className="text-2xl md:text-3xl font-black italic tracking-tighter cursor-pointer bg-linear-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 shrink-0"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSortBy("date-soon");
              }}
            >
              EventEase<span className="text-rose-500 not-italic">.</span>
            </h1>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 md:space-x-5 shrink-0">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300 hover:bg-gray-200 text-gray-900 transition-all active:scale-95 shadow-xs"
                    title="Profile"
                  >
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                  </button>

                  <button
                    onClick={() => navigate('/my-bookings')}
                    className="flex items-center space-x-2 bg-gray-900 text-white px-3 py-2 md:px-6 md:py-2.5 rounded-full font-bold text-[10px] md:text-sm hover:bg-black transition-all shadow-lg shadow-gray-200"
                  >
                    <Ticket className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">My Bookings</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 md:px-4 md:py-2 text-gray-500 hover:text-rose-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="relative overflow-hidden group flex items-center space-x-2 bg-linear-to-r from-[#991B1B] to-[#DC2626] text-white px-4 py-2 md:px-8 md:py-2.5 rounded-full font-bold hover:from-[#7F1D1D] hover:to-[#B91C1C] hover:shadow-xl hover:shadow-red-200/50 transition-all active:scale-95 text-xs md:text-sm"
                >
                  <User className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="mt-4 md:mt-0 md:absolute md:left-1/2 md:top-9/32 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-96 group">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-rose-500 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-400 rounded-full pl-10 pr-6 py-2 md:py-2.5 text-sm font-medium bg-gray-100 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all duration-300 shadow-inner" />
            </div>
          </div>
        </div>

        {/* CATEGORY NAV BAR */}

        <div className="bg-[#1a1f36] border-t border-white/5 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <nav className="grid grid-flow-col auto-cols-max sm:flex sm:flex-wrap sm:justify-between sm:w-full items-center gap-2 sm:gap-3 lg:gap-4 py-3 overflow-x-auto sm:overflow-visible no-scrollbar">
              {categories.map((item) => {
                const { Icon, color } = categoryIcons[item];

                return (
                  <button
                    key={item}
                    onClick={() => setSelectedCategory(item)}
                    className={`
              flex items-center gap-2.5
              px-4 md:px-5 py-2.5
              rounded-full text-xs md:text-sm font-semibold
              transition-all duration-300 whitespace-nowrap
              shrink-0 snap-center
              ${selectedCategory === item
                        ? "bg-white/10 text-white border border-white/20 shadow-lg scale-105"
                        : "text-gray-300 border border-transparent hover:bg-white/5 hover:text-white"
                      }
            `}
                  >
                    <Icon
                      size={18}
                      strokeWidth={2.3}
                      className={`${color} transition-transform duration-300 group-hover:scale-110`}
                    />
                    <span>{item}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>


      </header>

      {/*HERO SECTION*/}

      {!searchQuery && (
        <section className="max-w-7xl mx-auto my-6 px-4 animate-fadeIn">
          <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] lg:aspect-[21/6] rounded-2xl overflow-hidden shadow-2xl group bg-gray-900">

            {/* Hero Skeleton Overlay */}
            {!heroLoaded && <HeroImageSkeleton />}

            {/* Hero Carousel Images */}
            {[
              "/poster bg login.png",
              "/poster bg login1.png",
              "/poster bg login2.png",
            ].map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`Banner ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
                onLoad={() => {
                  if (index === currentSlide) setHeroLoaded(true);
                }}
                className={`absolute inset-0 w-full h-full object-cover
            transition-all duration-1000 group-hover:scale-105
            ${currentSlide === index && heroLoaded
                    ? "opacity-100"
                    : "opacity-0"
                  }`}
              />
            ))}

            {/* Existing Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-black/80 to-transparent" />

            {/* Existing Text */}

            {/* Dynamic Text for Each Carousel Image */}
            <div className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 text-white max-w-lg z-10">

              {currentSlide === 0 && (
                <>
                  <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
                    Discover Unforgettable<br />
                    <span className="text-yellow-200">Events in 2026</span>
                  </h2>
                  <p className="mt-4 text-sm md:text-base text-gray-300 font-medium">
                    Curated Events • Seamless Booking • Unforgettable Experiences
                  </p>
                </>
              )}

              {currentSlide === 1 && (
                <>
                  <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
                    Experience the<br />
                    <span className="text-yellow-200">Magic of Live Events</span>
                  </h2>
                  <p className="mt-4 text-sm md:text-base text-gray-300 font-medium">
                    Live Shows • Exciting Festivals • Unforgettable Experiences
                  </p>
                </>
              )}

              {currentSlide === 2 && (
                <>
                  <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
                    Feel the Thrill of<br />
                    <span className="text-yellow-200">Live Sports Events</span>
                  </h2>
                  <p className="mt-4 text-sm md:text-base text-gray-300 font-medium">
                    Live Matches • Passionate Fans • Unforgettable Action
                  </p>
                </>
              )}

            </div>


            {/* Previous Button */}
            <button
              type="button"
              onClick={() =>
                setCurrentSlide((prev) => (prev + 2) % 3)
              }
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20
          bg-black/40 text-white rounded-full p-3
          opacity-0 group-hover:opacity-100 transition-opacity"
            >
              &#10094;
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % 3)
              }
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20
          bg-black/40 text-white rounded-full p-3
          opacity-0 group-hover:opacity-100 transition-opacity"
            >
              &#10095;
            </button>

            {/* Carousel Indicator Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === index
                    ? "bg-yellow-200 w-7"
                    : "bg-white/60 w-2.5"
                    }`}
                />
              ))}
            </div>

          </div>
        </section>
      )}


      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* HEADER: Title & Sort Button */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-10 pb-4 border-b border-gray-200 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xxl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
              {searchQuery
                ? `Search: "${searchQuery}"`
                : (selectedCategory === 'All' ? <> Recommended</> : selectedCategory)}
            </h2>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:block">Sort By:</span>
            <div className="relative group">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-bold py-2.5 pl-9 pr-8 rounded-full shadow-sm hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all cursor-pointer"
              >
                <option value="date-soon">Date: Soonest First</option>
                <option value="date-later">Date: Latest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              {/* Custom arrow for select */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* GRID OF EVENTS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 lg:gap-8">
          {loading ? (
            <EventLoadingSpinner />
          ) : filteredEvents.length === 0 ? (
            <NoEventsState resetFilters={() => { setSearchQuery(""); setSelectedCategory("All"); setSortBy("date-soon"); }} />
          ) : (
            // Render Cards (Images load independentlys )
            filteredEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
