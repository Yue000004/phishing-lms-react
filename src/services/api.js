import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    console.error('Error recording user behavior:', error);
    throw error;
  }
};

export default apiClient;
