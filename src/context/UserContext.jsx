import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('phishing_lms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    // Standardizing user data structure
    const fullUserData = {
      userId: userData.userId || 'user-' + Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      gender: userData.gender,
      occupation: userData.occupation,
      interests: userData.interests || [],
      createdAt: userData.createdAt || new Date().toISOString()
    };
    setUser(fullUserData);
    localStorage.setItem('phishing_lms_user', JSON.stringify(fullUserData));
    // Also set the legacy ID for backward compatibility with existing stats logic if needed
    localStorage.setItem('phishing_lms_user_id', fullUserData.userId);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('phishing_lms_user');
    localStorage.removeItem('phishing_lms_user_id');
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('phishing_lms_user', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
