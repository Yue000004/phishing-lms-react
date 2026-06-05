const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const { db, admin } = require('../config/firebase');

// 初始化兩個 AI 引擎
const geminiKeys = (process.env.GEMINI_API_KEY || '').split(',').filter(k => k.trim() !== '');
let currentGeminiIndex = 0;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Task 10: 實作 Gemini 2.5 Flash 與 Groq 雙引擎容錯架構
 */
router.post('/generate', async (req, res) => {
  try {
    const { scenario, difficulty, occupation, interests, userId } = req.body;

    if (!scenario || !difficulty) {
      return res.status(400).json({ error: '缺少必要參數：scenario 或 difficulty' });
    }

    const profileContext = `
      【受害者個人輪廓】
      職業：${occupation || '一般職員'}
      感興趣的主題：${(interests && interests.length > 0) ? interests.join('、') : '日常社交與網購'}
    `;

    const systemPrompt = `
      你是一位精通資安教育與社會工程學的頂尖駭客。請根據情境：「${scenario}」與難度：「${difficulty}」，生成一封用於演練的模擬釣魚郵件。
      
      ${profileContext}

      規範：
      1. 絕不可使用真實品牌名稱（如 Netflix 改為 N3tf1ix-Sandbox）。
      2. 連結必須是模擬網址（例如 https://sandbox-phishing-demo.com/verify）。
      3. 難度低：明顯破綻（錯字、簡體字）。難度高：隱蔽破綻（專業語氣、高仿網域）。
      4. 內文請使用 Markdown 格式排版（不要用 HTML 標籤）。
      5. 誘餌策略：整合【貪婪】、【恐懼】、【好奇】或【急迫】心理。
      
      請嚴格回傳純 JSON 格式，結構必須完全符合：
      {
        "senderName": "偽造的顯示名稱",
        "senderEmail": "偽造的信箱",
        "subject": "郵件主旨",
        "bodyMarkdown": "郵件的 Markdown 內文，包含 [連結文字](https://sandbox-phishing-demo.com/verify) 形式的誘餌連結",
        "redFlags": ["危險訊號 1 解說", "危險訊號 2 解說"],
        "isPhishing": true
      }
    `;

    let phishingData;

    try {
      // 🚀 引擎 A：優先使用 Gemini (支援金鑰輪詢)
      console.log('🤖 嘗試使用 Gemini 生成...');
      if (geminiKeys.length === 0) throw new Error('未配置 Gemini API Key');
      
      const key = geminiKeys[currentGeminiIndex];
      currentGeminiIndex = (currentGeminiIndex + 1) % geminiKeys.length;
      
      const genAI = new GoogleGenerativeAI(key);
      const geminiModel = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash', // 使用穩定版本
        generationConfig: {
          responseMimeType: "application/json", 
          temperature: 0.7
        }
      });
      
      const result = await geminiModel.generateContent(systemPrompt);
      const responseText = result.response.text();
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      phishingData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      console.log(`✅ Gemini 生成成功！ (Key Index: ${currentGeminiIndex})`);

    } catch (geminiError) {
      console.warn('⚠️ Gemini 生成失敗，啟動 Groq 備援機制！錯誤原因:', geminiError.message);

      // 🚀 引擎 B：Gemini 失敗時，無縫切換 Groq (使用 Llama 3.3 70B 或 Gemma 2)
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "請現在根據系統指令生成 JSON 格式的釣魚信件資料。" }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          response_format: { type: "json_object" }
        });

        phishingData = JSON.parse(chatCompletion.choices[0].message.content);
        console.log('✅ Groq 備援生成成功！');
      } catch (groqError) {
        console.error('❌ Groq 備援也失效:', groqError.message);
        throw new Error('所有 AI 引擎皆暫時無法服務');
      }
    }

    // 加上 ID 與時間戳
    res.status(200).json({
      ...phishingData,
      id: 'ai-' + Date.now(),
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 雙引擎皆失效:', error);
    res.status(500).json({ 
      error: '生成釣魚郵件失敗，雙引擎皆發生異常。', 
      details: error.message 
    });
  }
});

/**
 * 行為紀錄路由
 */
router.post('/record', async (req, res) => {
  try {
    const { userId, action } = req.body;
    if (!userId) return res.status(400).json({ error: '缺少 userId' });

    const attemptData = {
      ...req.body,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    if (db) {
      const docRef = await db.collection('user_attempts').add(attemptData);
      console.log(`[API] ✅ 行為數據已存入 Firebase: ${docRef.id}`);
      res.status(200).json({ success: true, recordId: docRef.id });
    } else {
      console.warn('[API] Firebase 未連線，Log:', attemptData);
      res.status(200).json({ success: true, message: 'Offline mode' });
    }
  } catch (error) {
    res.status(500).json({ error: '紀錄失敗', details: error.message });
  }
});

/**
 * 分析數據路由
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!db) return res.json({ success: true, data: [], summary: { avgStayDuration: "0.0", urlCheckRate: 0, totalAttempts: 0 } });

    const snapshot = await db.collection('user_attempts').where('userId', '==', userId).get();
    
    if (snapshot.empty) {
      return res.json({ success: true, data: [], summary: { avgStayDuration: "0.0", urlCheckRate: 0, totalAttempts: 0 } });
    }

    let stats = { count: 0, stay: 0, hover: 0 };
    snapshot.forEach(doc => {
      const d = doc.data();
      stats.count++;
      stats.stay += (d.stayDuration || 0);
      if (d.hoverChecked) stats.hover++;
    });

    res.json({
      success: true,
      data: [{ subject: '資安警覺性', A: 85, fullMark: 100 }],
      summary: {
        avgStayDuration: (stats.stay / stats.count).toFixed(1),
        urlCheckRate: Math.round((stats.hover / stats.count) * 100),
        totalAttempts: stats.count
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
