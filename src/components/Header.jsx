import React from 'react';
import { Menu, Search, SlidersHorizontal, HelpCircle, Settings, Grid } from 'lucide-react';

const Header = ({ onMenuClick }) => {
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
          <svg
            className="h-8 w-10"
            viewBox="0 0 120 90"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 左紅 */}
            <path
              d="M10 20 L10 75 L30 75 L30 38 L60 60 L60 35 L25 10 Z"
              fill="#EA4335"
            />

            {/* 右紅 */}
            <path
              d="M95 10 L60 35 L60 60 L90 38 L90 75 L110 75 L110 20 Z"
              fill="#EA4335"
            />

            {/* 左藍 */}
            <path
              d="M10 20 L25 10 L60 35 L95 10 L110 20 L60 55 Z"
              fill="#4285F4"
            />

            {/* 左綠 */}
            <path
              d="M10 20 L10 28 L60 65 L60 55 Z"
              fill="#34A853"
            />

            {/* 右綠 */}
            <path
              d="M110 20 L110 28 L60 65 L60 55 Z"
              fill="#34A853"
            />

            {/* 黃色中心 */}
            <path
              d="M25 10 L60 35 L95 10 L85 10 L60 28 L35 10 Z"
              fill="#FBBC04"
            />
          </svg>
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
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Right: Icons & User */}
      <div className="flex items-center gap-1 text-gray-600 ml-4 min-w-[200px] justify-end">
        <button className="p-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
          <HelpCircle size={20} />
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
          <Settings size={20} />
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
          <Grid size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm ml-2 cursor-pointer font-medium hover:shadow-md transition-shadow">
          U
        </div>
      </div>
    </header>
  );
};

export default Header;
