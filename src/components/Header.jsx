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
          {/* Latest Gmail SVG Logo */}
          <svg className="h-8 w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 18H18V8L12 13L6 8V18H4V6C4 5.44772 4.44772 5 5 5H6L12 10L18 5H19C19.5523 5 20 5.44772 20 6V18Z" fill="#EA4335"/>
            <path d="M4 6V18H6V8L12 13L18 8V18H20V6C20 5.44772 19.5523 5 19 5H18L12 10L6 5H5C4.44772 5 4 5.44772 4 6Z" fill="#EA4335" fillOpacity="0.2"/>
            <path d="M20 18V6C20 5.44772 19.5523 5 19 5H18L12 10L6 5H5C4.44772 5 4 5.44772 4 6V18H6V8.5L12 13L18 8.5V18H20Z" style={{mixBlendMode:'multiply'}} fill="#EA4335"/>
            <path d="M12 10L18 5H19C19.5523 5 20 5.44772 20 6V7L12 12L4 7V6C4 5.44772 4.44772 5 5 5H6L12 10Z" fill="#FBBC04"/>
            <path d="M20 18V7L12 12L4 7V18H6V8.5L12 13L18 8.5V18H20Z" fill="#34A853"/>
            <path d="M4 18V6C4 5.44772 4.44772 5 5 5H6L12 10L18 5H19C19.5523 5 20 5.44772 20 6V18H18V8.5L12 13L6 8.5V18H4Z" fill="#4285F4"/>
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
