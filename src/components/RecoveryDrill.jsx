import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPhone, MdClose, MdError, MdSms } from 'react-icons/md';

const RecoveryDrill = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [status, setStatus] = useState('active'); // 'active' | 'success' | 'fail'
  const [showLure, setShowLure] = useState(false);
  const [dialedNumber, setDialedNumber] = useState('');

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

  const handleKeyClick = (key) => {
    if (status !== 'active') return;
    if (key === 'C') {
      setDialedNumber('');
    } else if (key === '⌫') {
      setDialedNumber(prev => prev.slice(0, -1));
    } else {
      if (dialedNumber.length < 15) {
        setDialedNumber(prev => prev + key);
      }
    }
  };

  const handleDial = () => {
    if (status !== 'active') return;
    if (!dialedNumber) {
      alert('請先輸入撥打號碼！');
      return;
    }
    // Correct actions: dialing 165 (Anti-fraud) or police 110, or typical bank hotline (starts with 0800)
    if (dialedNumber === '165' || dialedNumber.startsWith('0800') || dialedNumber === '110') {
      handleCorrectAction();
    } else {
      handleFail(`撥打到無效或錯誤的號碼: ${dialedNumber}`);
    }
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
            請立即利用虛擬手機撥打 <span className="text-red-400 font-bold">165 反詐騙專線</span> 或 <span className="text-red-400 font-bold">銀行免付費客服 (0800-XXX-XXX)</span> 辦理信用卡掛失止付！
          </p>
        </div>

        {/* 右側：互動手機 */}
        <div className="relative">
          {/* 虛擬手機 */}
          <div className="w-[300px] h-[600px] bg-black rounded-[50px] border-[8px] border-[#222] shadow-2xl overflow-hidden relative flex flex-col">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20"></div>

            {/* 簡訊通知 Banner - 從手機內部滑出 */}
            <AnimatePresence>
              {showLure && status === 'active' && (
                <motion.div
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  onClick={() => handleFail('誤點二次詐騙連結')}
                  className="absolute left-3 right-3 top-10 z-50 bg-white/95 backdrop-blur rounded-2xl p-3.5 shadow-2xl cursor-pointer hover:bg-red-50 transition-colors border border-red-500/30 flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between text-red-600">
                    <div className="flex items-center gap-1.5">
                      <MdSms size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">系統簡訊 (現在)</span>
                    </div>
                    {/* 關閉按鈕 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止點擊事件氣泡觸發 handleFail
                        setShowLure(false);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700"
                    >
                      <MdClose size={12} />
                    </button>
                  </div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-snug">
                    [緊急] 偵測到您的帳戶發生重大盜刷！請點此完成全額退款申請並撤銷扣款。
                  </div>
                  <div className="text-[9px] text-gray-400">
                    ⚠️ 警示：此為駭客慣用之二次詐騙簡訊，請勿點擊
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 bg-[#0a0a0a] flex flex-col p-6 pt-12">
              {status === 'active' && (
                <>
                  <div className="text-center mb-4">
                    <h3 className="text-white text-lg font-bold mb-1">虛擬撥號鍵盤</h3>
                    <p className="text-gray-500 text-[10px]">輸入 165 或銀行免付費專線辦理掛失</p>
                  </div>

                  {/* 顯示撥打的電話號碼 */}
                  <div className="text-white text-3xl font-mono text-center tracking-wider h-12 flex items-center justify-center gap-2 mb-4 bg-white/5 rounded-xl border border-white/10 px-2">
                    {dialedNumber || <span className="text-gray-600 text-lg font-sans">請輸入號碼</span>}
                  </div>

                  {/* 撥號鍵盤區 */}
                  <div className="grid grid-cols-3 gap-y-3 gap-x-5 justify-items-center mb-6">
                    {[
                      '1', '2', '3',
                      '4', '5', '6',
                      '7', '8', '9',
                      'C', '0', '⌫'
                    ].map(key => (
                      <button
                        key={key}
                        onClick={() => handleKeyClick(key)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all transform active:scale-95 ${
                          key === 'C' 
                            ? 'bg-red-950/40 text-red-400 border border-red-900/30 hover:bg-red-900/30' 
                            : key === '⌫' 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-white/5 text-white hover:bg-white/15'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  {/* 撥打綠色按鍵 */}
                  <button 
                    onClick={handleDial}
                    className="mt-auto bg-green-500 hover:bg-green-600 text-white w-full py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                  >
                    <MdPhone size={24} className="animate-bounce" />
                    <span className="text-base font-bold">撥號驗證</span>
                  </button>
                </>
              )}

              {status === 'success' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                    <MdPhone size={40} className="text-white" />
                  </div>
                  <h3 className="text-green-500 text-2xl font-bold mb-2">已成功掛失 / 聯防</h3>
                  <p className="text-gray-400 text-sm">正在成功為您止血資金...</p>
                </div>
              )}

              {status === 'fail' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
                    <MdClose size={40} className="text-white" />
                  </div>
                  <h3 className="text-red-500 text-2xl font-bold mb-2">二次受騙 / 止血失敗</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">您的動作慢了，或誤信二次退款簡訊陷阱，資金已遭全數轉移。</p>
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
