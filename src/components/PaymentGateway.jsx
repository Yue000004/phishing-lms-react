import React, { useState, useEffect } from 'react';
import { MdLock, MdCreditCard, MdOutlineHelpOutline, MdError } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const PaymentGateway = ({ amount = '2,990', onNext, onReport }) => {
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

  // Dynamic Branding Logic - Safely derived
  const getBrandTheme = () => {
    // Robust null check and string joining
    const subject = emailData?.subject || '';
    const sender = emailData?.senderName || '';
    const body = emailData?.bodyMarkdown || '';
    const text = `${subject} ${sender} ${body}`.toLowerCase();

    if (text.includes('thsrc') || text.includes('高鐵')) {
      return {
        name: '台灣高鐵 THSRC',
        color: 'bg-[#f58220]', 
        accent: 'text-[#f58220]',
        merchant: '台灣高速鐵路股份有限公司'
      };
    }
    if (text.includes('netflix') || text.includes('n3tf1ix')) {
      return {
        name: 'Netflix Payments',
        color: 'bg-[#E50914]',
        accent: 'text-[#E50914]',
        merchant: 'Netflix Entertainment Taiwan'
      };
    }
    if (text.includes('國泰') || text.includes('cathay')) {
      return {
        name: '國泰世華銀行 Cathay United Bank',
        color: 'bg-[#009241]', 
        accent: 'text-[#009241]',
        merchant: '國泰世華金流驗證系統'
      };
    }
    if (text.includes('中信') || text.includes('ctbc')) {
      return {
        name: '中國信託 CTBC Bank',
        color: 'bg-[#004a31]', 
        accent: 'text-[#004a31]',
        merchant: '中國信託信用卡驗證中心'
      };
    }
    if (text.includes('蝦皮') || text.includes('shopee')) {
      return {
        name: 'Shopee Pay',
        color: 'bg-[#ee4d2d]', 
        accent: 'text-[#ee4d2d]',
        merchant: '樂購蝦皮股份有限公司'
      };
    }
    if (text.includes('line pay')) {
      return {
        name: 'LINE Pay',
        color: 'bg-[#00b900]', 
        accent: 'text-[#00b900]',
        merchant: '連信股份有限公司 (LINE Pay)'
      };
    }
    return {
      name: '安全支付確認',
      color: 'bg-[#1a73e8]',
      accent: 'text-blue-600',
      merchant: '第三方合作金流商'
    };
  };

  // Only calculate theme if we might render the full page
  const theme = emailData ? getBrandTheme() : { color: 'bg-gray-400', accent: 'text-gray-400', name: '載入中', merchant: '...' };

  useEffect(() => {
    if (!emailData) {
        console.warn('⚠️ 遺失信件 Context，嘗試從 localStorage 恢復失敗，返回主畫面');
        const timer = setTimeout(() => navigate('/', { replace: true }), 2000);
        return () => clearTimeout(timer);
    }
  }, [emailData, navigate]);

  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});

  // P0: Error/Empty State Fallback - Prevent rendering child components that depend on data
  if (!emailData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
         <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center max-w-sm">
            <MdError size={64} className="text-red-400 mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">演練資料載入失敗</h2>
            <p className="text-gray-500 text-sm mb-6">我們找不到目前的演練情境，可能是因為瀏覽器隱私設定或頁面過期。</p>
            <button 
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all"
            >
              返回收件匣
            </button>
         </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.cardName || formData.cardName.trim().length < 2) {
      newErrors.cardName = '請輸入完整的持卡人姓名';
    }

    const rawCard = (formData.cardNumber || '').replace(/\s/g, '');
    if (rawCard.length !== 16) {
      newErrors.cardNumber = '請輸入正確的 16 位信用卡卡號';
    }

    if (!/^\d{2}\/\d{2}$/.test(formData.expiry || '')) {
      newErrors.expiry = '格式錯誤 (MM/YY)';
    } else {
      try {
        const [month, year] = formData.expiry.split('/').map(Number);
        if (month < 1 || month > 12) {
          newErrors.expiry = '月份無效';
        } else {
          const now = new Date();
          const currentMonth = now.getMonth() + 1;
          const currentYear = parseInt(now.getFullYear().toString().slice(-2));
          if (year < currentYear || (year === currentYear && month < currentMonth)) {
            newErrors.expiry = '卡片已過期';
          }
        }
      } catch (e) {
        newErrors.expiry = '格式解析錯誤';
      }
    }

    if (!/^\d{3}$/.test(formData.cvv || '')) {
      newErrors.cvv = 'CVV 需為 3 位數字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate() && typeof onNext === 'function') {
      onNext();
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    if (value.length <= 19) {
      setFormData({ ...formData, cardNumber: value });
      if (errors.cardNumber) setErrors({ ...errors, cardNumber: null });
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFormData({ ...formData, expiry: value });
    if (errors.expiry) setErrors({ ...errors, expiry: null });
  };

  const handleReportClick = () => {
    if (typeof onReport === 'function') {
      onReport();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start pt-10 px-4 font-sans overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-8 transition-all">
        {/* Header */}
        <div className={`${theme.color} p-6 text-white text-center relative`}>
          <div className="flex justify-center mb-3">
             <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <MdLock size={28} />
             </div>
          </div>
          <h2 className="text-xl font-black tracking-tight">{theme.name}</h2>
          <p className="text-white/80 text-[10px] mt-1 uppercase tracking-widest font-bold">Secure SSL Encryption Active</p>
        </div>

        {/* Brand/Merchant Info */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">訂單總額</p>
            <p className={`text-3xl font-black ${theme.accent}`}>NT$ {amount}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">收款商戶</p>
            <p className="text-sm font-bold text-gray-800">{theme.merchant}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex w-full h-1 bg-gray-100">
           <div className={`w-1/3 h-full ${theme.color}`}></div>
           <div className="w-2/3 h-full bg-gray-100"></div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 pb-20">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase flex justify-between">
              持卡人姓名 (英文)
              {errors.cardName && <span className="text-red-500 normal-case flex items-center gap-1 font-bold animate-pulse"><MdError />{errors.cardName}</span>}
            </label>
            <input
              type="text"
              placeholder="e.g. LI XIAO MING"
              className={`w-full border-2 rounded-xl px-4 py-4 text-lg font-bold outline-none transition-all ${errors.cardName ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500'}`}
              value={formData.cardName}
              onChange={(e) => {
                setFormData({ ...formData, cardName: e.target.value.toUpperCase() });
                if (errors.cardName) setErrors({ ...errors, cardName: null });
              }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase flex justify-between">
              信用卡卡號
              {errors.cardNumber && <span className="text-red-500 normal-case flex items-center gap-1 font-bold animate-pulse"><MdError />{errors.cardNumber}</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                className={`w-full border-2 rounded-xl pl-14 pr-4 py-4 text-lg font-mono font-bold outline-none transition-all ${errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500'}`}
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
              />
              <MdCreditCard className={`absolute left-5 top-1/2 -translate-y-1/2 ${errors.cardNumber ? 'text-red-400' : 'text-gray-300'}`} size={24} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase flex flex-col">
                <span>有效期限</span>
                {errors.expiry && <span className="text-red-500 normal-case text-[10px] font-bold mt-0.5">{errors.expiry}</span>}
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength="5"
                className={`w-full border-2 rounded-xl px-4 py-4 text-lg font-mono font-bold outline-none transition-all ${errors.expiry ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500'}`}
                value={formData.expiry}
                onChange={handleExpiryChange}
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase flex flex-col">
                <span>驗證碼 (CVV)</span>
                {errors.cvv && <span className="text-red-500 normal-case text-[10px] font-bold mt-0.5">{errors.cvv}</span>}
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="***"
                  maxLength="3"
                  className={`w-full border-2 rounded-xl px-4 py-4 text-lg font-mono font-bold outline-none transition-all ${errors.cvv ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500'}`}
                  value={formData.cvv}
                  onChange={(e) => {
                    setFormData({ ...formData, cvv: e.target.value });
                    if (errors.cvv) setErrors({ ...errors, cvv: null });
                  }}
                />
                <MdOutlineHelpOutline className={`absolute right-4 top-1/2 -translate-y-1/2 ${errors.cvv ? 'text-red-400' : 'text-gray-300'}`} size={20} />
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              className={`w-full ${theme.color} hover:brightness-110 text-white font-black py-5 rounded-2xl shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 text-lg`}
            >
              <MdLock size={22} />
              確認並授權付款
            </button>

            <button
              type="button"
              onClick={handleReportClick}
              className="w-full bg-white text-red-600 border-2 border-red-50 font-black py-4 rounded-2xl shadow-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <MdError size={20} />
              🚨 懷疑詐騙？即刻回報
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 opacity-30 grayscale pt-4">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-4" alt="Visa" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-6" alt="Mastercard" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/JCB_logo.svg/1280px-JCB_logo.svg.png" className="h-6" alt="JCB" />
          </div>
          
          <p className="text-[10px] text-center text-gray-400 leading-relaxed font-medium">
            您的交易資訊已受國際資安標準 PCI-DSS 與 256-bit SSL 加密技術保護。<br />
            點擊「確認」即視為您同意本平台的支付政策與條款。
          </p>
        </form>
      </div>
    </div>
  );
};

export default PaymentGateway;
