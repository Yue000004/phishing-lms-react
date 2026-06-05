import React, { useState, useEffect, useRef } from 'react';

const PhishingLink = ({ href, children, onHoverTrack, onClickTrack }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    timerRef.current = setTimeout(() => {
      setShowTooltip(true);
      if (onHoverTrack) onHoverTrack(href);
    }, 1000); // 1秒懸停偵測
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowTooltip(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (onClickTrack) onClickTrack(href);
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
      >
        {children}
      </a>

      {/* 畫面左下角浮現真實 URL */}
      {showTooltip && (
        <div className="fixed bottom-2 left-2 bg-gray-100 border border-gray-300 px-2 py-1 text-xs text-gray-700 z-50 rounded shadow-sm">
          {href}
        </div>
      )}
    </>
  );
};

export default PhishingLink;