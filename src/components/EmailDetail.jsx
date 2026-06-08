import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { 
  MdArrowBack, 
  MdArchive, 
  MdReportGmailerrorred, 
  MdDelete, 
  MdMarkAsUnread, 
  MdAccessTime, 
  MdAddTask, 
  MdArrowDropDown,
  MdReply,
  MdForward,
  MdGppMaybe,
  MdVerifiedUser
} from 'react-icons/md';

/**
 * Task 3 & 9: 使用 ReactMarkdown 渲染信件並實作事件代理
 */
const EmailDetail = ({ email, onBack, onAction, onLinkClick, onHoverTrack }) => {
  const [showDetails, setShowDetails] = useState(false);
  const contentRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // Task 3: 攔截點擊
  const handleBodyClick = (e) => {
    const target = e.target.closest('a, button, .phishing-link');
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      const href = target.getAttribute('href') || '模擬連結';
      if (onLinkClick) onLinkClick(href);
    }
  };

  // Task 3 & 4: 偵測懸停 (Event Delegation)
  const handleMouseOver = (e) => {
    const target = e.target.closest('a, button, .phishing-link');
    if (target) {
      const href = target.getAttribute('href') || '模擬連結';
      // 顯示左下角狀態列 (回報給 App.jsx)
      if (onHoverTrack) onHoverTrack(href, true);
    }
  };

  const handleMouseOut = (e) => {
    const target = e.target.closest('a, button, .phishing-link');
    if (target) {
      if (onHoverTrack) onHoverTrack(null, false);
    }
  };

  const formatCurrentTime = () => {
    const date = email?.timestamp ? new Date(email.timestamp) : new Date();
    return date.toLocaleString('zh-TW', { 
      hour12: true, 
      month: 'long', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric' 
    });
  };

  if (!email) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
      {/* 頂部工具列 */}
      <div className="h-12 border-b flex items-center px-2 md:px-4 justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-1 text-gray-600">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
            title="返回收件匣"
          >
            <MdArrowBack size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-1">
            <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MdArchive size={20} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MdReportGmailerrorred size={20} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MdDelete size={20} /></button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 scale-90 md:scale-100">
          <button 
            onClick={() => onAction('phishing')}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-3 md:px-4 py-1.5 rounded-full hover:bg-red-100 border border-red-200 font-bold text-xs md:text-sm transition-all"
          >
            <MdGppMaybe size={18} />
            <span className="hidden xs:inline">標示釣魚</span>
          </button>
          <button 
            onClick={() => onAction('safe')}
            className="flex items-center gap-2 bg-green-50 text-green-600 px-3 md:px-4 py-1.5 rounded-full hover:bg-green-100 border border-green-200 font-bold text-xs md:text-sm transition-all"
          >
            <MdVerifiedUser size={18} />
            <span className="hidden xs:inline">安全信件</span>
          </button>
        </div>
      </div>

      {/* 信件內容區 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl font-normal text-gray-900 mb-6 md:mb-8 md:ml-14 italic font-black">{email?.subject}</h1>

          <div className="flex items-start gap-3 md:gap-4 mb-8">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-base md:text-lg flex-shrink-0 font-medium shadow-md">
              {email?.senderName ? email.senderName[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900 text-sm md:text-base">{email?.senderName}</span>
                <span className="text-gray-500 text-[10px] md:text-xs truncate">
                  {showDetails ? `<${email?.senderEmail}>` : `<${email?.senderEmail?.split('@')[0]?.substring(0, 3)}...@...>`}
                </span>
                <button 
                  className={`p-0.5 hover:bg-gray-100 rounded transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <MdArrowDropDown size={20} className="text-gray-500" />
                </button>
              </div>
              {showDetails && (
                <div className="mt-2 p-3 bg-white border border-gray-200 rounded-xl shadow-lg text-xs md:text-sm text-gray-600 space-y-1 z-20 relative">
                  <div><span className="inline-block w-16 font-bold text-slate-800">寄件者：</span>{email?.senderName} &lt;{email?.senderEmail}&gt;</div>
                  <div><span className="inline-block w-16 font-bold text-slate-800">時間：</span>{formatCurrentTime()}</div>
                  <div><span className="inline-block w-16 font-bold text-slate-800">主旨：</span>{email?.subject}</div>
                  <div><span className="inline-block w-16 font-bold text-slate-800">寄給：</span>我 &lt;user@company.com&gt;</div>
                </div>
              )}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 flex-shrink-0">
              {formatCurrentTime()}
            </div>
          </div>

          {/* Task 9: Markdown 渲染 + Task 3 事件代理 */}
          <div 
            ref={contentRef}
            className="md:ml-14 prose prose-sm sm:prose-base max-w-none text-gray-800"
            onClick={handleBodyClick}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-blue-600 hover:text-blue-800 underline cursor-pointer phishing-link"
                  />
                )
              }}
            >
              {email?.bodyMarkdown || email?.bodyHtml || email?.content || '信件內容無法顯示...'}
            </ReactMarkdown>
          </div>

          <div className="mt-12 md:ml-14 flex gap-3 border-t border-gray-100 pt-8 pb-12">
            <button className="flex items-center gap-2 border border-gray-300 rounded-full px-4 md:px-6 py-2 text-xs md:text-sm text-gray-600 hover:bg-gray-50 transition-all font-bold">
              <MdReply size={18} /> 回覆
            </button>
            <button className="flex items-center gap-2 border border-gray-300 rounded-full px-4 md:px-6 py-2 text-xs md:text-sm text-gray-600 hover:bg-gray-50 transition-all font-bold">
              <MdForward size={18} /> 轉寄
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
