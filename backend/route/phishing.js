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
    const { scenario, difficulty, occupation, interests, userId, type = 'phishing' } = req.body;

    const isPhishing = type === 'phishing';

    const profileContext = `
      【受害者個人輪廓】
      職業：${occupation || '一般職員'}
      感興趣的主題：${(interests && interests.length > 0) ? interests.join('、') : '日常社交與網購'}
    `;

    const phishingScenarios = `
      1. 銀行帳戶異常：偵測到海外登入、帳號即將凍結（模仿國泰世華、中信等）。
      2. 信用卡驗證：響應防詐政策、3D Secure 驗證更新（模仿台新、玉山等）。
      3. 網購付款失敗：蝦皮、PChome 訂單未成功，需重新驗證信用卡。
      4. LINE Pay：付款功能即將停用、帳戶資訊不全，請重新驗證。
      5. 投資詐騙：AI 量化投資、保證獲利 20%、領取試用金。
    `;

    const safeScenarios = `
      1. 學校行政公告：選課提醒、停車證申請、圖書館活動通知。
      2. 平台登入提醒：GitHub、Google、LinkedIn 的安全登入通知（指向官方 google.com 等）。
      3. 訂單收據：foodpanda、Uber Eats、或電商的電子發票通知。
      4. 課程通知：Coursera、Udemy、或校內數位學習平台的作業更新。
    `;

    const systemPrompt = `
      你是一位精通資安教育與社會工程學的專家。請生成一封用於演練的郵件。
      類型：${isPhishing ? '【釣魚郵件】' : '【正常安全郵件】'}
      情境：${scenario || (isPhishing ? '隨機金融詐騙' : '日常行政通知')}
      難度：${difficulty || '高'}

      ${profileContext}

      ${isPhishing ? `
      【釣魚郵件規範】：
      1. 針對以下情境之一：${phishingScenarios}
      2. 絕不可使用真實品牌 URL，但要模仿得極像（如 Shopee 改為 Shoppe-verify.net）。
      3. 內文必須包含誘導點擊的連結 [連結文字](模擬 URL)。
      4. 誘餌策略：整合【貪婪】、【恐懼】、【好奇】或【急迫】。
      ` : `
      【正常郵件規範】：
      1. 情境參考：${safeScenarios}
      2. 語氣專業、平實，無威脅性，連結指向正確的官方網域（如 .edu.tw, github.com, google.com）。
      3. 內容詳實，符合正常行政或商業流程。
      `}

      請嚴格回傳純 JSON 格式，結構必須完全符合：
      {
        "senderName": "顯示名稱",
        "senderEmail": "寄件信箱",
        "subject": "郵件主旨",
        "bodyMarkdown": "Markdown 內文",
        "redFlags": ${isPhishing ? '["破綻 1", "破綻 2"]' : '[]'},
        "isPhishing": ${isPhishing}
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

    const newEmailData = {
      ...phishingData,
      userId: userId || 'unknown_user',
      isRead: false,
      generatedAt: new Date().toISOString()
    };

    let generatedId = 'ai-' + Date.now();

    if (db) {
      try {
        const docRef = await db.collection('emails').add({
          ...newEmailData,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        generatedId = docRef.id;
        console.log(`[API] ✅ 新釣魚信件已存入 Firebase, ID: ${generatedId}`);
      } catch (dbErr) {
        console.error('❌ Firebase 寫入信件失敗:', dbErr.message);
      }
    }

    res.status(200).json({
      ...newEmailData,
      id: generatedId
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
 * 讀取使用者歷史信件路由
 */
router.get('/emails/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!db) return res.json({ success: true, data: [] });

    const snapshot = await db.collection('emails').where('userId', '==', userId).get();
    
    let emails = [];
    snapshot.forEach(doc => {
      emails.push({ id: doc.id, ...doc.data() });
    });

    // 依 createdAt 降序排列 (新信在上) - 在記憶體排序避免建立複合索引
    emails.sort((a, b) => {
      const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });

    res.json({ success: true, data: emails });
  } catch (error) {
    console.error('❌ 讀取歷史信件失敗:', error.message);
    res.status(500).json({ error: '讀取歷史信件失敗', details: error.message });
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
 * 分析數據路由 - 實作真實心理維度計算
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!db) {
       return res.json({ 
         success: true, 
         data: [
           { subject: '貪婪度', A: 50, fullMark: 100 },
           { subject: '恐懼感', A: 50, fullMark: 100 },
           { subject: '粗心度', A: 50, fullMark: 100 },
           { subject: '急迫感', A: 50, fullMark: 100 }
         ], 
         summary: { avgStayDuration: "0.0", urlCheckRate: 0, totalAttempts: 0 } 
       });
    }

    const snapshot = await db.collection('user_attempts').where('userId', '==', userId).get();
    
    if (snapshot.empty) {
      return res.json({ 
        success: true, 
        data: [], 
        summary: { avgStayDuration: "0.0", urlCheckRate: 0, totalAttempts: 0 } 
      });
    }

    // 取得所有相關信件以分析情境類型
    const emailIds = new Set();
    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.emailId) emailIds.add(d.emailId);
    });

    let emailMap = {};
    if (emailIds.size > 0) {
      // 這裡簡單處理，因為 Firestore 不支援大量 IN 查詢，我們可能需要逐一抓取或批量
      const emailSnaps = await db.collection('emails').get(); // 簡易做法：抓全量或優化
      emailSnaps.forEach(doc => {
        if (emailIds.has(doc.id) || emailIds.has(doc.data().subject)) {
          emailMap[doc.id] = doc.data();
          emailMap[doc.data().subject] = doc.data();
        }
      });
    }

    let totalRiskScore = 0;
    let sessionsCount = 0;

    // 分組計算每個演練工作流的累計風險
    const sessionRisks = {};

    let typeStats = {
      financial: 0,
      investment: 0,
      shopping: 0
    };
    
    let correctCount = 0;
    let totalPhishingEncountered = 0;
    let actionLogs = [];

    snapshot.forEach(doc => {
      const d = doc.data();
      const email = emailMap[d.emailId] || {};
      const content = (email.subject + email.bodyMarkdown + (email.redFlags || []).join('')).toLowerCase();
      
      stats.totalCount++;
      stats.totalStay += (d.stayDuration || 0);
      if (d.hoverChecked) stats.totalHover++;

      // Log action for history
      actionLogs.push({
        id: doc.id,
        action: d.action,
        emailSubject: email.subject || '系統頁面',
        timestamp: d.timestamp ? d.timestamp.toDate() : new Date(),
        score: d.score || 0
      });

      // 計算正確辨識率 (如果是 phishing 且使用者選擇 phishing，或者如果是 safe 且使用者選擇 safe)
      if (email.id) {
        if (email.isPhishing) totalPhishingEncountered++;
        
        const isCorrect = (d.action === 'phishing' && email.isPhishing) || 
                          (d.action === 'safe' && !email.isPhishing) ||
                          (d.action === '成功防禦：回報釣魚');
        if (isCorrect) correctCount++;
      }

      // 如果失敗，統計類型
      const isFail = d.action === 'failed_phishing_test' || d.action === '點擊連結' || d.action === 'input_credit_card' || d.action === 'input_otp';
      if (isFail && email.isPhishing) {
        if (/投資|量化|獲利|獎金/.test(content)) typeStats.investment++;
        else if (/蝦皮|shopee|pchome|訂單|購物/.test(content)) typeStats.shopping++;
        else typeStats.financial++;
      }

      // 計算該次行為的風險點數 (P1 規則)
      let currentActionRisk = 0;
      if (d.action === '點擊連結') currentActionRisk = 20;
      if (d.action === 'input_credit_card') currentActionRisk = 30;
      if (d.action === 'input_otp') currentActionRisk = 20;
      if (d.action === 'failed_phishing_test') currentActionRisk = 30; 
      
      const sId = d.emailId || 'unknown';
      sessionRisks[sId] = (sessionRisks[sId] || 0) + currentActionRisk;

      // ... existing psychological dimension logic ...
      const isGreed = /退款|中獎|免費|優惠|禮品|獎金|提領/.test(content);
      const isFear = /停用|凍結|非法|警告|被盜|異常|扣款失敗/.test(content);
      const isUrgency = /立即|限時|24小時|火速|儘快|過期/.test(content);

      let carelessScore = 0;
      if (d.stayDuration < 10) carelessScore += 30;
      if (!d.hoverChecked) carelessScore += 40;
      if (d.action === 'input_credit_card') carelessScore += 20;
      if (d.action === 'input_otp') carelessScore += 10;
      
      stats.scores.careless.total += carelessScore;
      stats.scores.careless.count++;

      const weight = isFail ? 80 : 20;
      if (isGreed) {
        stats.scores.greed.total += weight;
        stats.scores.greed.count++;
      }
      if (isFear) {
        stats.scores.fear.total += weight;
        stats.scores.fear.count++;
      }
      if (isUrgency) {
        const urgencyWeight = (isUrgency && d.action === 'input_otp') ? 100 : weight;
        stats.scores.urgency.total += urgencyWeight;
        stats.scores.urgency.count++;
      }
    });

    const riskScores = Object.values(sessionRisks);
    totalRiskScore = riskScores.length > 0 ? Math.max(...riskScores) : 0;
    if (totalRiskScore > 100) totalRiskScore = 100;

    let riskLevel = '低風險';
    if (totalRiskScore > 70) riskLevel = '高風險';
    else if (totalRiskScore > 30) riskLevel = '中風險';

    // 排序日誌
    actionLogs.sort((a, b) => b.timestamp - a.timestamp);

    const getAvg = (s) => s.count > 0 ? Math.min(Math.round(s.total / s.count), 100) : 30;

    res.json({
      success: true,
      data: [
        { subject: '貪婪度', A: getAvg(stats.scores.greed), fullMark: 100 },
        { subject: '恐懼感', A: getAvg(stats.scores.fear), fullMark: 100 },
        { subject: '粗心度', A: getAvg(stats.scores.careless), fullMark: 100 },
        { subject: '急迫感', A: getAvg(stats.scores.urgency), fullMark: 100 }
      ],
      summary: {
        avgStayDuration: (stats.totalStay / stats.totalCount).toFixed(1),
        urlCheckRate: Math.round((stats.totalHover / stats.totalCount) * 100),
        totalAttempts: stats.totalCount,
        totalRiskScore,
        riskLevel,
        identificationRate: totalPhishingEncountered > 0 ? Math.round((correctCount / stats.totalCount) * 100) : 100,
        typeStats,
        recentActions: actionLogs.slice(0, 10)
      }
    });
  } catch (e) {
    console.error('Stats error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
