import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  MdArrowBack, 
  MdArchive, 
  MdReportGmailerrorred, 
  MdDelete, 
  MdArrowDropDown,
  MdReply,
  MdForward,
  MdGppMaybe,
  MdVerifiedUser
} from 'react-icons/md';

/**
 * Task 3 & 9: 使用 ReactMarkdown 渲染信件並實作事件代理
 * 新增 isPracticeMode 功能：新手導覽與互動高亮
 */
const EmailDetail = ({ email, onBack, onAction, onLinkClick, onHoverTrack, isPracticeMode = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [guideStep, setGuideStep] = useState(1);
  const contentRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // 當信件切換時，自動將導覽步驟重設回第一步
  useEffect(() => {
    setGuideStep(1);
  }, [email]);

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
        {/* 新手引導導覽橫幅 */}
        {isPracticeMode && (
          <div className="mx-auto max-w-4xl bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 mb-6 text-sm text-slate-800 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <span className="font-black text-blue-800 flex items-center gap-1.5 text-base">
                <span>🔰</span> <span>新手防詐引導練習 (步驟 {guideStep} / 3)</span>
              </span>
              <button 
                onClick={() => setGuideStep(0)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-xs"
              >
                關閉引導
              </button>
            </div>
            
            <div className="leading-relaxed mb-4 text-gray-700">
              {guideStep === 1 && (
                <div>
                  <strong>第一步：觀察寄件者來源</strong><br />
                  請檢視下方 <span className="bg-yellow-200 text-yellow-900 px-1.5 py-0.5 font-bold rounded">發黃光的寄件人資料欄位</span>。<br />
                  {email.isPhishing ? (
                    <span> 💡 此信件聲稱來自知名品牌，但寄件地址 <code>{email.senderEmail}</code> 卻使用非官方網域，這是非常典型的冒充手法！</span>
                  ) : (
                    <span> 💡 寄件者地址為 <code>{email.senderEmail}</code>，屬於該機構的真實網域，安全無虞。</span>
                  )}
                </div>
              )}
              {guideStep === 2 && (
                <div>
                  <strong>第二步：檢視急迫語氣或字眼</strong><br />
                  請檢視信件下方 <span className="bg-red-200 text-red-900 px-1.5 py-0.5 font-bold rounded">發紅光的主旨標題</span>。<br />
                  {email.isPhishing ? (
                    <span> 💡 釣魚信件常使用「立即驗證」、「限時停用」或「警告」等聳動字詞，藉此激發您的恐懼或急迫感，誘使您在慌亂中點擊連結。</span>
                  ) : (
                    <span> 💡 信件主旨表達溫和且具備行政公文常態，沒有惡意催促或恐嚇的成分。</span>
                  )}
                </div>
              )}
              {guideStep === 3 && (
                <div>
                  <strong>第三步：懸停超連結核對</strong><br />
                  請將滑鼠移到信件主體中 <span className="bg-blue-200 text-blue-900 px-1.5 py-0.5 font-bold rounded">閃爍藍光的超連結</span> 上（不要點選），並觀察<strong>左下角的預覽網址</strong>。<br />
                  {email.isPhishing ? (
                    <span> 💡 連結指向的真實目標是 <code>{email.senderEmail?.includes('cathay') ? 'cathay-bk-verify.net' : 'shoppe-verify.net'}</code> 等偽造網域，並非真實品牌網站！</span>
                  ) : (
                    <span> 💡 連結指向正確的官方頁面（如電商或學校官方主網域），安全度高。</span>
                  )}
                </div>
              )}
              {guideStep === 0 && (
                <div>
                  <strong>引導已完成！請做出決定：</strong><br />
                  現在請依據您學到的指標，在右上角點擊：
                  若此信有破綻請按 <span className="text-red-600 font-bold">標示釣魚</span>；若確定無害請按 <span className="text-green-600 font-bold">安全信件</span>。
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {guideStep > 1 && (
                <button 
                  onClick={() => setGuideStep(prev => prev - 1)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  上一步
                </button>
              )}
              {guideStep > 0 && guideStep < 3 && (
                <button 
                  onClick={() => setGuideStep(prev => prev + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  下一步
                </button>
              )}
              {guideStep === 3 && (
                <button 
                  onClick={() => setGuideStep(0)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  完成引導，前往答題
                </button>
              )}
              {guideStep === 0 && (
                <button 
                  onClick={() => setGuideStep(1)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  重新引導
                </button>
              )}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* 主旨：在第二步時會發紅光高亮 */}
          <h1 className={`text-xl md:text-2xl font-normal text-gray-900 mb-6 md:mb-8 md:ml-14 italic font-black transition-all duration-300 ${
            (isPracticeMode && guideStep === 2) ? 'bg-red-100 text-red-950 p-3 rounded-2xl ring-2 ring-red-400 shadow-md scale-[1.01]' : ''
          }`}>
            {email?.subject}
          </h1>

          {/* 寄件人：在第一步時會發黃光高亮 */}
          <div className={`flex items-start gap-3 md:gap-4 mb-8 p-3 rounded-2xl transition-all duration-300 ${
            (isPracticeMode && guideStep === 1) ? 'bg-yellow-50 text-yellow-950 ring-2 ring-yellow-400 shadow-md scale-[1.01]' : ''
          }`}>
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

          {/* Markdown 渲染：在第三步時，內部的超連結會呈現藍色發光與閃爍 */}
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
                    className={`text-blue-600 hover:text-blue-800 underline cursor-pointer phishing-link transition-all duration-300 ${
                      (isPracticeMode && guideStep === 3) 
                        ? 'bg-blue-100 text-blue-900 ring-4 ring-blue-400 px-3 py-1.5 rounded-xl font-black animate-pulse shadow-sm' 
                        : ''
                    }`}
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
