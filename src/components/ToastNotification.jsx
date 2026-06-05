import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdChatBubble } from 'react-icons/md';

const DISTRACTION_MESSAGES = [
  { id: 1, sender: '張主管 (HR)', message: '那個... 今天的出勤紀錄你還沒確認喔，急！', avatar: 'https://i.pravatar.cc/150?u=hr' },
  { id: 2, sender: '老闆 (CEO)', message: '下午三點的會議報告準備好了嗎？等下先傳給我看。', avatar: 'https://i.pravatar.cc/150?u=ceo' },
  { id: 3, sender: '小李 (技術部)', message: '欸，伺服器好像有點慢，你有在跑什麼大程式嗎？', avatar: 'https://i.pravatar.cc/150?u=tech' },
  { id: 4, sender: '系統管理員', message: '提醒：您的密碼將在 24 小時後過期，請儘速更新。', avatar: 'https://i.pravatar.cc/150?u=sys' },
  { id: 5, sender: '美食外送', message: '您的訂單已送達櫃檯，請記得下樓領取喔！', avatar: 'https://i.pravatar.cc/150?u=food' },
];

const ToastNotification = () => {
  const [currentToast, setCurrentToast] = useState(null);

  useEffect(() => {
    const triggerRandomToast = () => {
      // 隨機選一個訊息
      const randomIndex = Math.floor(Math.random() * DISTRACTION_MESSAGES.length);
      setCurrentToast(DISTRACTION_MESSAGES[randomIndex]);

      // 3.5 秒後消失
      setTimeout(() => {
        setCurrentToast(null);
      }, 3500);

      // 設定下一次觸發的時間 (15~30秒之間)
      const nextDelay = Math.random() * (30000 - 15000) + 15000;
      return setTimeout(triggerRandomToast, nextDelay);
    };

    // 初始等待 10 秒後開始第一次干擾
    const initialTimer = setTimeout(triggerRandomToast, 10000);

    return () => clearTimeout(initialTimer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none">
      <AnimatePresence>
        {currentToast && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-white border border-gray-200 shadow-2xl rounded-lg p-4 w-[320px] flex items-start gap-3"
          >
            {/* Avatar / Icon */}
            <div className="flex-shrink-0">
              <img 
                src={currentToast.avatar} 
                alt={currentToast.sender} 
                className="w-10 h-10 rounded-full border border-gray-100"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-sm text-gray-900 truncate">{currentToast.sender}</span>
                <span className="text-[10px] text-gray-400">現在</span>
              </div>
              <p className="text-sm text-gray-600 leading-snug line-clamp-2">
                {currentToast.message}
              </p>
              <div className="mt-2 flex gap-2">
                <button className="text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                  立即回覆
                </button>
                <button className="text-[11px] font-bold text-gray-400 hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                  稍後再說
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setCurrentToast(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MdClose size={18} />
            </button>

            {/* Notification Badge */}
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
              <MdChatBubble size={10} className="text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotification;
