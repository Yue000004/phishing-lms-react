const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKeys = (process.env.GEMINI_API_KEY || '').split(',').filter(k => k.trim() !== '');
let currentKeyIndex = 0;

if (apiKeys.length === 0) {
  console.warn('⚠️ 警告: 尚未設定任何 GEMINI_API_KEY 環境變數。');
}

/**
 * 獲取下一個可用的模型實例 (輪詢)
 * Task 5: 提高 temperature 到 0.7
 */
const getModel = () => {
  if (apiKeys.length === 0) return null;
  
  const key = apiKeys[currentKeyIndex];
  const genAI = new GoogleGenerativeAI(key);
  // 每次呼叫後切換索引
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  
  return genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json"
    }
  });
};

module.exports = { getModel };
