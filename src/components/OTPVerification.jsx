import React, { useState, useEffect } from 'react';
import { MdSecurity, MdPhonelinkLock, MdRefresh, MdError } from 'react-icons/md';

const OTPVerification = ({ onVerify, expectedOtp }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError(null);

      // Auto-focus next input
      if (value !== '' && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredCode = otp.join('');
    
    if (enteredCode.length === 6) {
      if (enteredCode === expectedOtp) {
        onVerify(enteredCode);
      } else {
        setError('驗證碼錯誤，請檢查您的手機簡訊後重新輸入');
        // Reset OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0').focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Bank Branding Placeholder */}
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdSecurity className="text-blue-600" size={28} />
            <span className="font-black text-xl tracking-tighter text-gray-800">TRUST BANK</span>
          </div>
          <div className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold uppercase">
            已啟用 3D Secure
          </div>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdPhonelinkLock className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">簡訊驗證碼</h2>
            <p className="text-gray-500 text-sm mt-2 px-4">
              我們已向您綁定的手機號碼 <span className="font-bold text-gray-700">09**-***-123</span> 發送了一個 6 位數驗證碼。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  className={`w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold outline-none transition-all ${
                    error ? 'border-red-500 bg-red-50 animate-shake' : 'border-gray-200 focus:border-blue-500 focus:ring-0'
                  }`}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-medium animate-fade-in">
                <MdError />
                {error}
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                驗證碼將於 <span className="font-bold text-red-500">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span> 後失效
              </p>
              <button 
                type="button"
                className="text-sm font-bold text-blue-600 flex items-center justify-center gap-1 mx-auto hover:underline"
                disabled={timer > 0}
              >
                <MdRefresh size={16} />
                重新發送驗證碼
              </button>
            </div>

            <button
              type="submit"
              disabled={otp.join('').length < 6}
              className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98]"
            >
              提交驗證碼
            </button>

            {/* Task 5: Escape Hatch */}
            <button
              type="button"
              onClick={onReport}
              className="w-full bg-red-50 text-red-600 border-2 border-red-200 font-black py-4 rounded-xl shadow-sm hover:bg-red-100 transition-all mt-4 flex items-center justify-center gap-2"
            >
              <MdError size={20} />
              🚨 察覺異常：回報為釣魚網站
            </button>
          </form>

          <p className="text-[11px] text-gray-400 text-center mt-8 px-6 leading-tight">
            請注意：銀行絕不會主動要求您提供此驗證碼。若非本人操作，請立即聯繫客服中心。
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
