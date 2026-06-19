const express = require('express');
const cors = require('cors');
require('dotenv').config();

const phishingRoutes = require('./route/phishing');
const authRoutes = require('./route/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/phishing', phishingRoutes);
app.use('/api/auth', authRoutes);

// New Dashboard Summary API
app.get('/api/dashboard/summary', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  
  // Reuse the logic by internally calling or redirecting, 
  // but for simplicity in this demo environment, we'll just redirect to the existing endpoint
  // or I can just import and use the logic. 
  // Better: just add the route to phishing.js and mount it here.
  res.redirect(`/api/phishing/stats/${userId}`);
});

app.get('/api/health', (req, res) => {
  const { db } = require('./config/firebase');
  if (!db) {
  return res.json({
    success: true,
    data: [],
    summary: {
      avgStayDuration: "0.0",
      urlCheckRate: 0,
      totalAttempts: 0,
      note: "firebase disabled"
    }
  });
}
  res.status(200).json({ 
    status: 'ok', 
    message: 'Phishing Sandbox Backend is running!',
    firebase: !!db,
  });
});

app.listen(PORT, () => {
  console.log(`✅ 伺服器已成功啟動，正在監聽 Port ${PORT}`);
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Phishing LMS Backend is running',
  });
});
