// 假定的 API 呼叫函式，預計拋轉給 FastAPI 或 Moodle 後端
export const trackUserBehavior = async (data) => {
  console.log('--- [Tracking Data Sent] ---', data);
  
  // 模擬網路延遲
  return new Promise((resolve) => {
    setTimeout(() => {
      // 這裡未來可以改為真正的 fetch('https://api.lms.com/track', { method: 'POST', body: JSON.stringify(data) })
      resolve({ status: 'success', recordedAt: new Date().toISOString() });
    }, 500);
  });
};