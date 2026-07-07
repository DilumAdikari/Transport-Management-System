import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "sonner"; 
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

function App() {
  // 1. Initialize user state from LocalStorage to keep user logged in on refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("tms_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Function to handle Login (Saves data)
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("tms_user", JSON.stringify(userData));
  };

  // 3. Function to handle Logout (Clears everything)
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("tms_user");
    localStorage.removeItem("token");
    // Force a clean redirect to login
  };

  return (
    <>
      {/* Global notifications (Login success, Driver added, etc.) */}
      <Toaster position="top-right" richColors closeButton />
      
      <Routes>
        {/* LOGIN ROUTE 
            If user is already logged in, redirect them straight to dashboard.
        */}
        <Route 
          path="/login" 
          element={!user ? <Login setUser={handleLogin} /> : <Navigate to="/dashboard" />} 
        />

        {/* PROTECTED DASHBOARD ROUTE
            We pass 'user' for permissions and 'handleLogout' to make the button work.
        */}
        <Route 
          path="/dashboard/*" 
          element={
            user ? (
              <Dashboard user={user} setUser={handleLogout} /> 
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* ROOT REDIRECT */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} />} 
        />

        {/* CATCH-ALL REDIRECT */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;