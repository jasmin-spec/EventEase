
export default function Footer() {
  return (
    //Show footer dta
  <footer className="bg-gray-900 text-white py-1 px-4 sm:px-6 mt-10 w-full">  
  <div className="max-w-md mx-auto text-center">
    
    <h2 className="text-lg sm:text-xl font-bold mb-0">
      EventEase
    </h2>

    <p className="text-gray-400 text-sm sm:text-base mb-1 leading-relaxed">
      Discover events, create memories, and enjoy every moment.
    </p>

    <p className="text-gray-500 text-xs sm:text-sm">
      © {new Date().getFullYear()} EventEase. All rights reserved.
    </p>
  </div>
</footer>
  );
}
