import React, { useState } from 'react';
import { Menu, Search, SlidersHorizontal, HelpCircle, Settings, Grid, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import GmailLogo from './GmailLogo';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

  return (
    <header className="h-16 flex items-center px-4 justify-between bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Left: Menu & Logo */}
      <div className="flex items-center gap-2 min-w-0 md:min-w-[240px]">
        <button 
          onClick={onMenuClick}
          className="p-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors text-gray-600 md:hidden"
        >
          <Menu size={20} />
        </button>
        <button 
          className="hidden md:block p-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors text-gray-600"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center ml-2 cursor-pointer">
          <GmailLogo className="h-8 w-8" />
          <span className="text-xl ml-2 text-gray-700 font-medium tracking-tight">Gmail</span>
        </div>
      </div>

      {/* Middle: Search Bar (Modern Material 3 Style) */}
      <div className="flex-1 max-w-[720px] ml-4">
        <div className="bg-gray-100 hover:bg-white hover:shadow-md focus-within:bg-white focus-within:shadow-md rounded-full h-12 flex items-center px-6 gap-4 border border-transparent focus-within:border-gray-200 transition-all duration-200">
          <Search size={20} className="text-gray-500" />
          <input 
            type="text" 
            placeholder="搜尋郵件" 
            className="bg-transparent flex-1 outline-none text-[16px] placeholder-gray-500 text-gray-800"
          />
          <button className="p-2 hover:bg-200 rounded-full transition-colors text-gray-500">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Right: Icons & User */}
      <div className="flex items-center gap-1 text-gray-600 ml-4 min-w-[200px] justify-end relative">
        <button className="p-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
          <HelpCircle size={20} />
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
          <Settings size={20} />
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
          <Grid size={20} />
        </button>
        
        {/* User Profile Avatar */}
        <div 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm ml-2 cursor-pointer font-medium hover:shadow-md transition-shadow select-none"
        >
          {userInitial}
        </div>

        {/* Dropdown Backdrop */}
        {showUserMenu && (
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowUserMenu(false)}></div>
        )}

        {/* User Profile Menu Popover */}
        {showUserMenu && (
          <div className="absolute right-0 top-12 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-50 flex flex-col items-center animate-fade-in text-gray-800">
            <div className="text-[11px] text-gray-400 font-bold mb-4 font-mono select-all truncate max-w-full">
              {user?.email || 'guest@example.com'}
            </div>
            
            {/* Large Avatar */}
            <div className="w-16 h-16 rounded-full bg-purple-700 text-white text-2xl flex items-center justify-center font-bold mb-3 shadow-md">
              {userInitial}
            </div>

            {/* User Info */}
            <div className="text-lg font-black text-gray-900 mb-1">
              Hi, {user?.name || '使用者'}
            </div>
            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 font-medium">
              職業：{user?.occupation || '未指定'}
            </div>

            {/* Divider */}
            <div className="w-full border-t border-gray-100 my-4"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer text-sm shadow-sm"
            >
              <LogOut size={16} />
              <span>登出系統</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
