import React, { useState } from 'react';
import HackedModal from './HackedModal';

const PhishingSimulator = () => {
  const [scenario, setScenario] = useState('Netflix催繳');
  const [difficulty, setDifficulty] = useState('低');
  const [emailData, setEmailData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHacked, setIsHacked] = useState(false);

  const generateEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/phishing/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenario, difficulty }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setEmailData(data);
    } catch (error) {
      console.error('Error generating email:', error);
      alert('生成信件失敗，請檢查後端伺服器是否運行。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailClick = (e) => {
    // 只要點擊了內文區塊
    setIsHacked(true);

    // 背景非同步呼叫 Record API
    fetch('http://localhost:5000/api/phishing/record', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test_user_01',
        action: '點擊惡意連結',
        emailId: emailData?.subject || 'unknown'
      }),
    }).catch((err) => console.error('Record failed:', err));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">釣魚信沙盒模擬器</h2>
      
      {/* 控制面板 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600">情境選擇</label>
          <select 
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="border p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="Netflix催繳">Netflix 催繳</option>
            <option value="Google帳戶安全警示">Google 帳戶安全警示</option>
            <option value="銀行轉帳通知">銀行轉帳通知</option>
            <option value="公司內部人資通知">公司內部人資通知</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600">難度等級</label>
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="低">低 (明顯破綻)</option>
            <option value="高">高 (隱蔽性強)</option>
          </select>
        </div>

        <button
          onClick={generateEmail}
          disabled={isLoading}
          className={`px-6 py-2 rounded-md font-bold text-white transition-all ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? '生成中...' : '生成釣魚信'}
        </button>
      </div>

      {/* 郵件顯示區 */}
      {emailData && (
        <div className="bg-white border rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-100 p-4 border-b">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-gray-500 w-16">寄件人:</span>
              <span className="text-gray-800 font-medium">{emailData.senderName} &lt;{emailData.senderEmail}&gt;</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 w-16">主旨:</span>
              <span className="text-gray-800 font-bold">{emailData.subject}</span>
            </div>
          </div>
          
          <div className="p-8">
            <div 
              dangerouslySetInnerHTML={{ __html: emailData.bodyHtml }} 
              onClick={handleEmailClick}
              className="email-body-container cursor-pointer hover:bg-gray-50 transition-colors border-2 border-transparent hover:border-blue-100 rounded p-4"
              title="點擊內文或按鈕以進行互動"
            />
          </div>
        </div>
      )}

      {!emailData && !isLoading && (
        <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-lg">
          請選擇情境並點擊「生成釣魚信」開始演練
        </div>
      )}

      {/* 被駭特效 Modal */}
      {isHacked && <HackedModal onClose={() => setIsHacked(false)} />}
    </div>
  );
};

export default PhishingSimulator;
