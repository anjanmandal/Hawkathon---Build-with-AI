// client/src/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/apiConfig';

const AuthContext = createContext();
import { useNavigate } from 'react-router-dom';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
   const navigate = useNavigate();

  // Optional: check session on page load
  useEffect(() => {
    api.get('/users/profile')
      .then((res) => {
        console.log(res.data);
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = () => {
    setUser(null);
    api.get('/auth/logout')
    .then(()=>{
      navigate('/login')
    })
      .catch((err) => console.error(err));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
