import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdWifi, MdSignalCellular4Bar, MdBatteryFull, MdSms } from 'react-icons/md';

const VirtualPhone = ({ show, otpCode }) => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (show) {
      // 模擬收到簡訊的延遲
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowNotification(false);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 500, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 500, opacity: 0 }}
          className="fixed bottom-0 right-10 z-[300] w-[280px] h-[560px] bg-black rounded-t-[40px] border-[6px] border-[#333] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
        >
          {/* Status Bar */}
          <div className="h-10 bg-black flex items-center justify-between px-6 pt-4 text-white text-[10px] font-bold">
            <span>12:05</span>
            <div className="flex items-center gap-1">
              <MdSignalCellular4Bar size={12} />
              <MdWifi size={12} />
              <MdBatteryFull size={12} className="rotate-90" />
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 bg-[#121212] relative overflow-hidden flex flex-col items-center justify-center">
            {/* Wallpaper (Dark gradient) */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black pointer-events-none"></div>

            {/* Notification Toast */}
            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute top-4 left-2 right-2 bg-white/90 backdrop-blur rounded-2xl p-3 shadow-lg z-10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-green-500 p-1 rounded-md text-white">
                      <MdSms size={14} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">訊息</span>
                    <span className="text-[10px] text-gray-400 ml-auto">現在</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900 mb-0.5">Trust Bank 驗證碼</div>
                  <div className="text-[11px] text-gray-600 leading-tight">
                    您好，您的網路交易驗證碼為 <span className="font-bold text-blue-600 underline text-lg block my-1 tracking-widest">{otpCode}</span> 請於 2 分鐘內輸入。
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lock Screen Clock */}
            <div className="text-white text-center mt-[-100px] z-0">
              <div className="text-6xl font-light">12:05</div>
              <div className="text-sm mt-2 text-blue-200">5月29日 星期五</div>
            </div>
            
            {/* Lock Icon */}
            <div className="absolute bottom-16 text-white/50 flex flex-col items-center gap-2">
              <div className="w-10 h-1 h-[4px] bg-white/20 rounded-full mb-8"></div>
              <span className="text-[10px] uppercase tracking-[3px] font-bold">向上滑動解鎖</span>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="h-6 bg-black flex items-center justify-center">
            <div className="w-24 h-1 bg-white/30 rounded-full"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VirtualPhone;
