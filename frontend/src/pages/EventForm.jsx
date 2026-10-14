const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token'); 
  
  
  const data = new FormData(e.target); 
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  try {
    await axios.post(`${API_BASE}/api/events`, data, {
      headers: {
        'Authorization': `Bearer ${token}`, 
      }
    }); 

    navigate('/organizer-dashboard');
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Something went wrong";
    console.error("Error: " + errorMsg);
  }
};