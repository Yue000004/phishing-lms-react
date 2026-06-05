import React, { useState } from 'react';
import { MdLock, MdCreditCard, MdOutlineHelpOutline, MdError } from 'react-icons/md';

const PaymentGateway = ({ amount = '2,990', onNext }) => {
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    // Name validation
    if (formData.cardName.trim().length < 3) {
      newErrors.cardName = '請輸入完整的持卡人姓名';
    }

    // Card number validation (Basic length check for simulation)
    const rawCard = formData.cardNumber.replace(/\s/g, '');
    if (rawCard.length !== 16) {
      newErrors.cardNumber = '請輸入正確的 16 位信用卡卡號';
    }

    // Expiry validation (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = '格式錯誤 (MM/YY)';
    } else {
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
    }

    // CVV validation
    if (!/^\d{3}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV 需為 3 位數字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-[#1a73e8] p-6 text-white text-center relative">
          <div className="flex justify-center mb-2">
            <MdLock size={24} />
          </div>
          <h2 className="text-xl font-bold">安全支付確認</h2>
          <p className="text-blue-100 text-sm mt-1">付款至：第三方合作金流商</p>
        </div>

        {/* Order Info */}
        <div className="p-6 border-b border-gray-100 bg-blue-50/50 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">訂單金額</p>
            <p className="text-2xl font-black text-gray-900">NT$ {amount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">商戶名稱</p>
            <p className="text-sm font-medium text-gray-700 underline">THSRC Online Store</p>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
              持卡人姓名
              {errors.cardName && <span className="text-red-500 normal-case flex items-center gap-1 font-normal"><MdError />{errors.cardName}</span>}
            </label>
            <input
              type="text"
              placeholder="例如：WANG XIAO MING"
              className={`w-full border rounded-lg px-4 py-3 outline-none transition-all ${errors.cardName ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
              value={formData.cardName}
              onChange={(e) => {
                setFormData({ ...formData, cardName: e.target.value.toUpperCase() });
                if (errors.cardName) setErrors({ ...errors, cardName: null });
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
              信用卡卡號
              {errors.cardNumber && <span className="text-red-500 normal-case flex items-center gap-1 font-normal"><MdError />{errors.cardNumber}</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                className={`w-full border rounded-lg pl-12 pr-4 py-3 outline-none transition-all ${errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
              />
              <MdCreditCard className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.cardNumber ? 'text-red-400' : 'text-gray-400'}`} size={20} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex flex-col">
                <span>有效期限</span>
                {errors.expiry && <span className="text-red-500 normal-case text-[10px] font-normal mt-0.5">{errors.expiry}</span>}
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength="5"
                className={`w-full border rounded-lg px-4 py-3 outline-none transition-all ${errors.expiry ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                value={formData.expiry}
                onChange={handleExpiryChange}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex flex-col">
                <span>驗證碼 (CVV)</span>
                {errors.cvv && <span className="text-red-500 normal-case text-[10px] font-normal mt-0.5">{errors.cvv}</span>}
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="123"
                  maxLength="3"
                  className={`w-full border rounded-lg px-4 py-3 outline-none transition-all ${errors.cvv ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                  value={formData.cvv}
                  onChange={(e) => {
                    setFormData({ ...formData, cvv: e.target.value });
                    if (errors.cvv) setErrors({ ...errors, cvv: null });
                  }}
                />
                <MdOutlineHelpOutline className={`absolute right-4 top-1/2 -translate-y-1/2 ${errors.cvv ? 'text-red-400' : 'text-gray-400'}`} size={18} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
          >
            <MdLock size={18} />
            確認支付 NT$ {amount}
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

          <p className="text-[11px] text-center text-gray-400 mt-4 leading-tight">
            您的支付資訊將受到 256 位元 SSL 加密保護。<br />
            點擊確認即表示您同意相關支付條款與細則。
          </p>
        </form>
      </div>
    </div>
  );
};

export default PaymentGateway;
