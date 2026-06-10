import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdWarningAmber, MdCheckCircle, MdError, MdInfoOutline, MdLightbulbOutline } from 'react-icons/md';

const TeachableModal = ({ isOpen, onClose, email, triggerType }) => {
  if (!isOpen) return null;

  const isWarning = triggerType === 'click' || triggerType === 'wrong_answer' || triggerType === 'recovery_fail';
  const isRecovery = triggerType === 'recovery_success' || triggerType === 'recovery_fail';

  const getTitle = () => {
    switch (triggerType) {
      case 'click': return '危險！您點擊了釣魚連結並送出了 OTP';
      case 'wrong_answer': return '判斷錯誤：這是一封釣魚信件';
      case 'correct_answer': return '正確判斷！您成功避開了陷阱';
      case 'recovery_success': return '搶救成功！您在黃金時間內完成了掛失';
      case 'recovery_fail': return '搶救失敗：資金已不幸全數流出';
      case 'safe_completed': return '成功完成正常信件流程';

      default: return '演練解析';
    }
  };

  // Safe fallback for email explanation
  const isPhishingEmail = email?.isPhishing === true;
  const explanation = email?.explanation || '這封信件利用了緊急感與利益誘惑（如扣款失敗、優惠失效）來誘使您在慌亂中做出決定。';
  const suspiciousElements = email?.suspiciousElements || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          >
            {/* Header */}
            <div className={`p-6 ${isWarning ? 'bg-red-50' : 'bg-green-50'} border-b flex items-center gap-4`}>
              <div className={`p-3 rounded-full ${isWarning ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {isWarning ? <MdWarningAmber size={32} /> : <MdCheckCircle size={32} />}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isWarning ? 'text-red-900' : 'text-green-900'}`}>
                  {getTitle()}
                </h2>
                <p className="text-gray-600 text-sm">本次演練關鍵點解析</p>
              </div>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {/* 信件破綻解析 */}
              {isPhishingEmail && (
                <div className="border-2 border-red-200 rounded-xl p-6 mb-6 relative bg-red-50/30">
                  <div className="absolute -top-3 left-6 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    Phishing Analysis
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <MdInfoOutline className="text-red-500" />
                        為什麼它是釣魚信？
                      </h4>

                      <p className="text-gray-700 leading-relaxed text-sm">
                        {explanation}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {suspiciousElements.length > 0 ? (
                        suspiciousElements.map((el, i) => (
                          <span
                            key={i}
                            className="bg-white text-red-600 text-[11px] font-bold px-3 py-1 rounded-full border border-red-200 shadow-sm"
                          >
                            #{el}
                          </span>
                        ))
                      ) : (
                        <span className="bg-white text-red-600 text-[11px] font-bold px-3 py-1 rounded-full border border-red-200 shadow-sm">
                          #偽造網域
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {!isPhishingEmail && (
                <div className="border-2 border-green-200 rounded-xl p-6 mb-6 relative bg-green-50/30">
                  <div className="absolute -top-3 left-6 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    Safe Email
                  </div>

                  <h4 className="font-bold text-gray-800 mb-2">
                    為什麼這是正常信件？
                  </h4>

                  <p className="text-gray-700 text-sm leading-relaxed">
                    這封信件來自合法來源，連結指向正常官方網站，
                    內容符合一般行政或商業流程。
                    在真實世界中，使用者應完成正常操作流程，
                    而不是因為看到連結就直接判定為釣魚郵件。
                  </p>
                </div>
              )}

              {/* 搶救行為解析 (只有在 recovery 觸發後顯示) */}
              {isRecovery && (
                <div className={`border-2 rounded-xl p-6 mb-6 relative ${triggerType === 'recovery_success' ? 'border-green-200 bg-green-50/30' : 'border-orange-200 bg-orange-50/30'}`}>
                   <div className={`absolute -top-3 left-6 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${triggerType === 'recovery_success' ? 'bg-green-500' : 'bg-orange-500'}`}>
                    Recovery Strategy
                  </div>
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <MdLightbulbOutline className={triggerType === 'recovery_success' ? 'text-green-600' : 'text-orange-600'} />
                    搶救行為解析
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {triggerType === 'recovery_success' 
                      ? '做得好！在發現中招的第一時間，最重要的動作就是「聯絡銀行掛失卡片」。您成功忽略了旁邊可疑的「快速退款」連結，那是詐騙集團常見的二次傷害手段。'
                      : '可惜。在慌亂中，使用者很容易點擊跳出來的「退款連結」。請記住：銀行絕不會透過簡訊或不明網頁要求您點擊連結申請退款，正確做法應是撥打卡片背面的客服電話。'}
                  </p>
                </div>
              )}

              {/* 資安小撇步 */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                  <MdLightbulbOutline className="text-blue-600" />
                  資安防護指南
                </h4>
                <ul className="text-sm text-blue-800 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">1</span>
                    <span><span className="font-bold">冷靜停看聽：</span>任何帶有「緊急」、「逾期」、「帳戶凍結」字眼的信件都要提高警覺。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">2</span>
                    <span><span className="font-bold">檢查來源：</span>點擊寄件者名稱查看真實 Email 位址，確認網域是否正確（例如 thsrc.com.tw 變成了 thsrc-promo.net）。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">3</span>
                    <span><span className="font-bold">官方管道：</span>若不確定資訊真偽，請自行開啟瀏覽器輸入官方網址，或撥打官方客服，切勿透過信件連結進入。</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={onClose}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
              >
                我知道了，繼續演練
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TeachableModal;
