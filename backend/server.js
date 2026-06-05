const express = require('express');
const cors = require('cors');
require('dotenv').config();

const phishingRoutes = require('./route/phishing');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/phishing', phishingRoutes);

app.get('/api/health', (req, res) => {
  const { db } = require('./config/firebase');
  const { model } = require('./config/gemini');
  res.status(200).json({ 
    status: 'ok', 
    message: 'Phishing Sandbox Backend is running!',
    firebase: !!db,
    gemini: !!model
  });
});

app.listen(PORT, () => {
  console.log(`✅ 伺服器已成功啟動，正在監聽 Port ${PORT}`);
});
