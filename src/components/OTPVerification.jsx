import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSecurity, MdPhonelinkLock, MdRefresh, MdError } from 'react-icons/md';

/**
 * Task 6: 修復 OTP 頁面白屏與魯棒性強化
 */
const OTPVerification = ({ onVerify = () => {}, expectedOtp = '', onReport = () => {} }) => {
  const navigate = useNavigate();
  
  // P0: Replace location.state with robust localStorage management
  const [emailData, setEmailData] = useState(() => {
    try {
      const stored = localStorage.getItem('current_phishing_scenario');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return null;
    }
  });

  // Dynamic Branding Logic (Matching PaymentGateway) - Safely derived
  const getBrandTheme = () => {
    const subject = emailData?.subject || '';
    const sender = emailData?.senderName || '';
    const body = emailData?.bodyMarkdown || '';
    const text = `${subject} ${sender} ${body}`.toLowerCase();
    
    if (text.includes('thsrc') || text.includes('高鐵')) {
      return {
        name: '台灣高鐵 THSRC',
        color: 'bg-[#f58220]',
        accent: 'text-[#f58220]',
        bankName: 'THSRC SecurePay'
      };
    }
    if (text.includes('netflix') || text.includes('n3tf1ix')) {
      return {
        name: 'Netflix Payments',
        color: 'bg-[#E50914]',
        accent: 'text-[#E50914]',
        bankName: 'Netflix Security'
      };
    }
    if (text.includes('國泰') || text.includes('cathay')) {
      return {
        name: '國泰世華銀行 Cathay United Bank',
        color: 'bg-[#009241]',
        accent: 'text-[#009241]',
        bankName: 'Cathay United Bank'
      };
    }
    if (text.includes('中信') || text.includes('ctbc')) {
      return {
        name: '中國信託 CTBC Bank',
        color: 'bg-[#004a31]',
        accent: 'text-[#004a31]',
        bankName: 'CTBC BANK'
      };
    }
    if (text.includes('蝦皮') || text.includes('shopee')) {
      return {
        name: 'Shopee Pay',
        color: 'bg-[#ee4d2d]',
        accent: 'text-[#ee4d2d]',
        bankName: 'Shopee Secure'
      };
    }
    if (text.includes('line pay')) {
      return {
        name: 'LINE Pay',
        color: 'bg-[#00b900]',
        accent: 'text-[#00b900]',
        bankName: 'LINE Pay Security'
      };
    }
    return {
      name: 'TRUST BANK',
      color: 'bg-blue-600',
      accent: 'text-blue-600',
      bankName: 'TRUST BANK'
    };
  };

  // Safe theme calculation
  const theme = emailData ? getBrandTheme() : { color: 'bg-blue-600', accent: 'text-blue-600', bankName: '安全驗證' };

  useEffect(() => {
    if (!emailData) {
        console.warn('⚠️ 遺失信件 Context，嘗試從 localStorage 恢復失敗，即將返回主畫面');
        const timer = setTimeout(() => navigate('/', { replace: true }), 2500);
        return () => clearTimeout(timer);
    }
  }, [emailData, navigate]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // P0: Error/Empty State Fallback - Prevent rendering child components that depend on data
  if (!emailData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
         <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <MdError size={40} className="text-red-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">安全驗證逾時</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                系統無法偵測到有效的交易請求。為保護您的帳戶安全，請返回收件匣重新發起請求。
            </p>
            <button 
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-95"
            >
              返回收件匣
            </button>
         </div>
      </div>
    );
  }

  const handleChange = (index, value) => {
    try {
      const char = value.slice(-1); // Only take the last character if pasted
      if (/^\d*$/.test(char)) {
        const newOtp = [...otp];
        newOtp[index] = char;
        setOtp(newOtp);
        setError(null);

        // Auto-focus next input
        if (char !== '' && index < 5) {
          const nextInput = document.getElementById(`otp-${index + 1}`);
          if (nextInput) nextInput.focus();
        }
      }
    } catch (err) {
      console.error('OTP input error:', err);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    try {
      const enteredCode = (otp || []).join('');
      
      if (enteredCode.length === 6) {
        if (enteredCode === expectedOtp) {
          if (typeof onVerify === 'function') onVerify(enteredCode);
        } else {
          setError('驗證碼錯誤，請檢查您的手機簡訊後重新輸入');
          setOtp(['', '', '', '', '', '']);
          const firstInput = document.getElementById('otp-0');
          if (firstInput) firstInput.focus();
        }
      }
    } catch (err) {
      console.error('OTP submit error:', err);
      setError('提交時發生錯誤，請稍後再試');
    }
  };

  const handleReportClick = () => {
    if (typeof onReport === 'function') onReport();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden my-8 transition-all">
        {/* Bank Branding Placeholder */}
        <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-2">
            <MdSecurity className={theme.accent} size={28} />
            <span className="font-black text-xl tracking-tighter uppercase">{theme.bankName}</span>
          </div>
          <div className={`text-[10px] ${theme.color.replace('bg-', 'bg-').replace('[', '').replace(']', '').includes('#') ? 'bg-gray-100 text-gray-700' : theme.color.replace('bg-', 'bg-') + '/10 ' + theme.accent} px-2 py-1 rounded font-bold uppercase`}>
            已啟用 3D Secure
          </div>
        </div>

        {/* Progress Bar (2/3 complete) */}
        <div className="flex w-full h-1 bg-gray-100">
           <div className={`w-2/3 h-full ${theme.color}`}></div>
           <div className="w-1/3 h-full bg-gray-100"></div>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme.color} text-white shadow-lg`}>
              <MdPhonelinkLock size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">簡訊驗證碼</h2>
            <p className="text-gray-500 text-sm mt-3 px-2 font-medium">
              基於安全考量，我們已向您綁定的手機號碼 <span className="font-black text-gray-800">09**-***-123</span> 發送了一個 6 位數驗證碼，請於下方輸入以完成授權。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 text-slate-800">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  inputMode="numeric"
                  className={`w-10 sm:w-12 h-14 border-2 rounded-xl text-center text-2xl font-black outline-none transition-all ${
                    error ? 'border-red-500 bg-red-50 animate-shake' : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-0'
                  }`}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-bold animate-pulse">
                <MdError />
                {error}
              </div>
            )}

            <div className="text-center bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-1 font-bold uppercase tracking-widest">有效期限倒數</p>
              <p className="text-lg font-black text-red-500">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
              <button 
                type="button"
                className={`text-xs font-bold flex items-center justify-center gap-1 mx-auto mt-2 ${timer > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
                disabled={timer > 0}
              >
                <MdRefresh size={14} />
                重新發送驗證碼
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={otp.join('').length < 6}
                className={`w-full ${theme.color} hover:brightness-110 disabled:bg-gray-200 disabled:grayscale text-white font-black py-5 rounded-2xl shadow-xl transition-all transform active:scale-[0.98] text-lg`}
              >
                提交驗證碼
              </button>

              <button
                type="button"
                onClick={onReport}
                className="w-full bg-white text-red-600 border-2 border-red-50 font-black py-4 rounded-2xl shadow-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <MdError size={20} />
                🚨 發現異常：回報釣魚網站
              </button>
            </div>
          </form>

          <p className="text-[10px] text-gray-400 text-center mt-8 px-4 leading-relaxed font-medium">
            <span className="font-bold text-gray-500">安全提示：</span>
            本銀行絕不會要求您在電話或不明網頁中提供此驗證碼。請確保留在官方加密網域內進行操作。
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
