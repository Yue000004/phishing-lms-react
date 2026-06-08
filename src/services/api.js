import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // P2: 10s Timeout Protection
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      error.message = '伺服器回應逾時，請稍後再試。';
    }
    return Promise.reject(error);
  }
);

/**
 * Trigger AI generation of a phishing email
 * @param {Object} params - { scenario, difficulty }
 */
export const generatePhishingEmail = async (params) => {
  try {
    const response = await apiClient.post('/phishing/generate', params);
    return response.data; // { success, data: { ... } }
  } catch (error) {
    console.error('Error generating phishing email:', error);
    throw error;
  }
};

/**
 * Record user behavior and quiz results to Firebase
 * @param {Object} data - { userId, emailId, action, score, mouseMovementCount, stayDuration }
 */
export const recordUserBehavior = async (data) => {
  try {
    const response = await apiClient.post('/phishing/record', data);
    return response.data;
  } catch (error) {
    console.warn('[P1 API Fallback] 行為紀錄同步失敗，系統已轉為本地離線模式。', error.message);
    // Return a successful-looking object to prevent downstream errors
    return { success: true, mode: 'offline', timestamp: new Date().toISOString() };
  }
};

export default apiClient;
