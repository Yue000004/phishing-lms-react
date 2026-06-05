import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPhone, MdClose, MdError, MdArrowForward, MdSms } from 'react-icons/md';

const RecoveryDrill = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [status, setStatus] = useState('active'); // 'active' | 'success' | 'fail'
  const [showLure, setShowLure] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && status === 'active') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      
      // 在 5 秒後跳出「退款誘餌」
      if (timeLeft === 25) setShowLure(true);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && status === 'active') {
      handleFail('逾時未處理');
    }
  }, [timeLeft, status]);

  const handleCorrectAction = () => {
    setStatus('success');
    setTimeout(() => onComplete('success'), 2000);
  };

  const handleFail = (reason) => {
    setStatus('fail');
    setTimeout(() => onComplete('fail', reason), 2000);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black flex items-center justify-center overflow-hidden">
      {/* 背景震撼特效 - 持續震動 */}
      <div className="absolute inset-0 opacity-30 pointer-events-none animate-hacker-glitch">
        <div className="absolute inset-0 bg-gradient-to-t from-red-900 via-transparent to-red-900"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-12 p-6">
        
        {/* 左側：警告資訊與倒數 */}
        <div className="text-white space-y-6 flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-red-600 px-4 py-1 rounded-full animate-pulse">
            <MdError size={20} />
            <span className="font-bold tracking-tighter uppercase">緊急止血程序</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black leading-tight italic">
            黃金 30 秒<br />
            <span className="text-red-500">阻止資金流出</span>
          </h2>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">剩餘時間</span>
              <span className={`text-4xl font-mono font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                00:{String(timeLeft).padStart(2, '0')}
              </span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="bg-red-500 h-full" 
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / 30) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed">
            系統偵測到一筆 <span className="text-white font-bold">NT$ 150,000</span> 的異常交易。<br />
            請立即使用您的手機進行「掛失處理」。
          </p>
        </div>

        {/* 右側：互動手機 */}
        <div className="relative">
          {/* 誘餌通知 (Lure) */}
          <AnimatePresence>
            {showLure && status === 'active' && (
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                onClick={() => handleFail('誤點二次詐騙連結')}
                className="absolute -left-20 top-20 z-50 bg-white rounded-xl p-4 shadow-2xl cursor-pointer hover:bg-red-50 transition-colors border-2 border-red-500 w-64 group"
              >
                <div className="flex items-center gap-2 mb-1 text-red-600">
                  <MdSms size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">系統通知</span>
                </div>
                <div className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  [緊急] 偵測到盜刷，點此立即申請全額退款
                </div>
                <div className="mt-2 text-[10px] text-gray-400">
                  * 駭客常用的二次詐騙手法
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 虛擬手機 */}
          <div className="w-[300px] h-[600px] bg-black rounded-[50px] border-[8px] border-[#222] shadow-2xl overflow-hidden relative flex flex-col">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20"></div>

            <div className="flex-1 bg-[#0a0a0a] flex flex-col p-6 pt-12">
              {status === 'active' && (
                <>
                  <div className="text-center mb-12">
                    <h3 className="text-white text-xl font-bold mb-2">虛擬撥號</h3>
                    <p className="text-gray-500 text-xs">撥打 24H 銀行客服中心進行掛失</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-12">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map(num => (
                      <div key={num} className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white text-xl hover:bg-white/20 cursor-pointer transition-colors font-medium">
                        {num}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={handleCorrectAction}
                    className="mt-auto bg-green-500 hover:bg-green-600 text-white w-full py-5 rounded-3xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                  >
                    <MdPhone size={24} className="animate-bounce" />
                    <span className="text-lg font-bold">撥打銀行掛失專線</span>
                  </button>
                </>
              )}

              {status === 'success' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                    <MdPhone size={40} className="text-white" />
                  </div>
                  <h3 className="text-green-500 text-2xl font-bold mb-2">已成功掛失</h3>
                  <p className="text-gray-400 text-sm">正在為您聯繫銀行專員...</p>
                </div>
              )}

              {status === 'fail' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6">
                    <MdClose size={40} className="text-white" />
                  </div>
                  <h3 className="text-red-500 text-2xl font-bold mb-2">止血失敗</h3>
                  <p className="text-gray-400 text-sm italic">您剛才的決定讓損害擴大了</p>
                </div>
              )}
            </div>
            
            <div className="h-6 bg-black flex items-center justify-center pb-2">
              <div className="w-32 h-1 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 text-xs font-mono tracking-widest uppercase">
        Recovery sandbox system v1.0 // secure connection established
      </div>
    </div>
  );
};

export default RecoveryDrill;
