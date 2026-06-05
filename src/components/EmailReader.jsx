import React, { useState, useEffect, useRef } from 'react';

const EmailReader = ({ email, onAction, onLinkClick, onHoverTrack }) => {
  const [showDetails, setShowDetails] = useState(false);
  const contentRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const [hoveredUrl, setHoveredUrl] = useState(null);

  useEffect(() => {
    if (!email || !contentRef.current) return;

    // 取得所有具有 phishing-link 類別的連結
    const links = contentRef.current.querySelectorAll('.phishing-link');
    
    const handleClick = (e) => {
      e.preventDefault();
      const href = e.currentTarget.getAttribute('href');
      if (onLinkClick) onLinkClick(href);
    };

    const handleMouseEnter = (e) => {
      const href = e.currentTarget.getAttribute('href');
      hoverTimerRef.current = setTimeout(() => {
        setHoveredUrl(href);
        if (onHoverTrack) onHoverTrack(href);
      }, 1000);
    };

    const handleMouseLeave = () => {
      setHoveredUrl(null);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };

    links.forEach(link => {
      link.addEventListener('click', handleClick);
      link.addEventListener('mouseenter', handleMouseEnter);
      link.addEventListener('mouseleave', handleMouseLeave);
    });

    // Cleanup listeners
    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleClick);
        link.removeEventListener('mouseenter', handleMouseEnter);
        link.removeEventListener('mouseleave', handleMouseLeave);
      });
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [email, onLinkClick, onHoverTrack]);

  if (!email) return (
    <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
      <span className="material-icons !text-6xl">mail_outline</span>
      <p>請選擇一封信件開始測驗</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* 頂部工具列 */}
      <div className="h-12 border-b flex items-center px-4 justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-6 text-gray-600">
          <span className="material-icons hover:bg-gray-100 p-2 rounded-full cursor-pointer">arrow_back</span>
          <span className="material-icons hover:bg-gray-100 p-2 rounded-full cursor-pointer">archive</span>
          <span className="material-icons hover:bg-gray-100 p-2 rounded-full cursor-pointer">report_gmailerrorred</span>
          <span className="material-icons hover:bg-gray-100 p-2 rounded-full cursor-pointer">delete</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onAction('phishing')}
            className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 border border-red-200 font-medium text-sm"
          >
            <span className="material-icons">gpp_maybe</span>
            標示為釣魚信件
          </button>
          <button 
            onClick={() => onAction('safe')}
            className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-md hover:bg-green-100 border border-green-200 font-medium text-sm"
          >
            <span className="material-icons">verified_user</span>
            安全信件
          </button>
        </div>
      </div>

      {/* 信件內容區 */}
      <div className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-normal text-gray-900 mb-6">{email.subject}</h1>

        <div className="flex items-start gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg flex-shrink-0">
            {email.senderName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 truncate">{email.senderName}</span>
              <span className="text-gray-500 text-xs truncate">
                &lt;{showDetails ? email.senderEmail : '......'}&gt;
              </span>
              <span 
                className={`material-icons text-gray-400 cursor-pointer transition-transform ${showDetails ? 'rotate-180' : ''}`}
                onClick={() => setShowDetails(!showDetails)}
              >
                arrow_drop_down
              </span>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              寄給 我
              <span className="material-icons !text-xs">arrow_drop_down</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex-shrink-0">
            {new Date().toLocaleString()}
          </div>
        </div>

        <div 
          ref={contentRef}
          className="pl-13 max-w-2xl text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: email.content }}
        />
      </div>

      {/* 懸停網址提示 */}
      {hoveredUrl && (
        <div className="fixed bottom-2 left-2 bg-gray-100 border border-gray-300 px-2 py-1 text-xs text-gray-700 z-50 rounded shadow-sm">
          {hoveredUrl}
        </div>
      )}
    </div>
  );
};

export default EmailReader;