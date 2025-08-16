import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Subscriptions from './pages/Subscriptions';

const App = () => {
  const { token, logout } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {token && (
          <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
            <div className="flex space-x-4">
              <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
              <Link to="/categories" className="hover:text-gray-300">Categories</Link>
              <Link to="/subscriptions" className="hover:text-gray-300">Subscriptions</Link>
            </div>
            <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">
              Logout
            </button>
          </nav>
        )}
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/categories" element={token ? <Categories /> : <Navigate to="/login" />} />
          <Route path="/subscriptions" element={token ? <Subscriptions /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;