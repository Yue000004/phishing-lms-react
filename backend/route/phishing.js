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
    
    // Dynamic Date Calculation
    const now = new Date();
    const currentDateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    const profileContext = `
      【受害者個人輪廓】
      職業：${occupation || '一般職員'}
      感興趣的主題：${(interests && interests.length > 0) ? interests.join('、') : '日常社交與網購'}
    `;

    const phishingScenarios = `
      1. 信用卡交易異常警示：偵測到一筆海外或未授權的信用卡扣款交易，要求持卡人限時點擊連結驗證或取消交易，否則視為本人授權。
      2. 信用卡 3D Secure 安全驗證協議升級：宣稱響應防詐新規，持卡人需點擊連結完成信用卡安全協議升級認證。
      3. 網購付款/授權失敗：宣稱某電商（如蝦皮、PChome、Momo）訂單之信用卡付款未成功或授權失敗，要求點擊連結重新補填信用卡與驗證資訊以利出貨。
      4. 訂閱帳戶（如 Netflix、Spotify）扣款失敗：宣稱訂閱扣款信用卡遭拒，需限時點擊連結重新填寫信用卡與驗證資訊以避免服務遭中斷。
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
      情境：${isPhishing ? '金融與信用卡交易驗證/異常處理相關' : (scenario || '日常行政通知')}
      難度：${difficulty || '高'}

      【目前系統時間】：${currentDateStr} （信件內容若包含日期或限時資訊，必須以該時間為基準或稍微往後推算，使其看起來是「最近、即時或今天」發生的，絕對不可出現 2024 年或更早的年份，年份應符合 ${now.getFullYear()} 年或更晚）。

      ${profileContext}

      ${isPhishing ? `
      【釣魚郵件規範】：
      1. 針對以下情境之一，且「必須」圍繞在需要使用信用卡付款、驗證、補卡或取消授權等主題：${phishingScenarios}
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
      console.log("[AI DEBUG] Gemini Keys Count:", geminiKeys.length);
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

    console.log('================================');
    console.log('userId from request =', userId);
    console.log('newEmailData.userId =', newEmailData.userId);
    console.log('subject =', newEmailData.subject);
    console.log('================================');

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
    console.log(
      '[Record]',
      req.body.action,
      req.body.emailId,
      req.body.emailSubject
    );
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
    
    const stats = {
      totalCount: 0,
      totalStay: 0,
      totalHover: 0,
      scores: {
        greed: {
          total: 0,
          count: 0
        },
        fear: {
          total: 0,
          count: 0
        },
        careless: {
          total: 0,
          count: 0
        },
        urgency: {
          total: 0,
          count: 0
        }
      }
    };

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

      console.log('========== USER ATTEMPT ==========');
      console.log('emailId =', d.emailId);
      console.log('action =', d.action);

      if (d.emailId) {
        emailIds.add(d.emailId);
      }
    });

    let emailMap = {};
    if (emailIds.size > 0) {
      // 這裡簡單處理，因為 Firestore 不支援大量 IN 查詢，我們可能需要逐一抓取或批量
      const emailSnaps = await db.collection('emails').get(); // 簡易做法：抓全量或優化
      emailSnaps.forEach(doc => {
        if (emailIds.has(doc.id) || emailIds.has(doc.data().subject)) {
          emailMap[doc.id] = {
            id: doc.id,
            ...doc.data()
          };
          emailMap[doc.data().subject] = {
            id: doc.id,
            ...doc.data()
          };
        }
      });
    }
    console.log('emailIds =', [...emailIds]);
    console.log('emailMap keys =', Object.keys(emailMap));

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

      const email =
        emailMap[d.emailId] ||
        emailMap[d.emailSubject];

      if (!email && !d.action.startsWith('recovery')) {
        console.warn(
          '[Dashboard] 找不到 email',
          d.emailId,
          d.emailSubject
        );
        // 如果找不到 email，但有 isPhishing 欄位，我們仍可繼續部分邏輯
      }

      // 使用紀錄中的 isPhishing，若無則 fallback 到 email 物件
      const isPhishingEmail = d.isPhishing !== undefined ? d.isPhishing : email?.isPhishing;
      const content =
        (
          (email?.subject || d.emailSubject || '') +
          (email?.bodyMarkdown || '') +
          (email?.redFlags || []).join('')
        ).toLowerCase();
      
      stats.totalCount++;
      stats.totalStay += (d.stayDuration || 0);
      if (d.hoverChecked) stats.totalHover++;

      // Log action for history
      actionLogs.push({
        id: doc.id,
        action: d.action,
        emailSubject:
          email?.subject ||
          d.emailSubject ||
          '系統頁面',
        timestamp: d.timestamp ? d.timestamp.toDate() : new Date(),
        score: d.score || 0
      });

      // 計算正確辨識率 (修改目標 13: 改用 correct === true)
      if (d.correct === true) correctCount++;
      if (isPhishingEmail === true) totalPhishingEncountered++;

      // 如果失敗，統計類型
      const isFail = d.correct === false;
      if (isFail && isPhishingEmail) {
        if (/投資|量化|獲利|獎金/.test(content)) typeStats.investment++;
        else if (/蝦皮|shopee|pchome|訂單|購物/.test(content)) typeStats.shopping++;
        else typeStats.financial++;
      }
      
      // 修改目標 11, 12: Dashboard 風險分數重構 (使用 d.correct 和 d.isPhishing)
      let currentActionRisk = 0;
      if (d.correct === true) {
        currentActionRisk = 0;
      } else {
        // 只有在行為錯誤時才計算風險
        if (d.action === 'click_link') currentActionRisk += 20;
        if (d.action === 'input_credit_card') currentActionRisk += 30;
        if (d.action === 'input_otp') currentActionRisk += 20;
        if (d.action === 'failed_phishing_test') currentActionRisk += 30;
        
        // 安全信件誤判 (把安全信件當成釣魚回報)
        if (isPhishingEmail === false && d.action === 'report_phishing') {
          currentActionRisk += 20;
        }
      }
      
      const sId = d.emailId || d.emailSubject || 'unknown';
      sessionRisks[sId] = (sessionRisks[sId] || 0) + currentActionRisk;

      // 心理特徵分析 (修改目標 12: 優先判斷 correct 與 isPhishing)
      const isGreed = /退款|中獎|免費|優惠|禮品|獎金|提領/.test(content);
      const isFear = /停用|凍結|非法|警告|被盜|異常|扣款失敗/.test(content);
      const isUrgency = /立即|限時|24小時|火速|儘快|過期/.test(content);

      if (isPhishingEmail === true) {
        let carelessScore = 0;

        if (d.stayDuration < 10) carelessScore += 30;
        if (!d.hoverChecked) carelessScore += 40;
        if (d.action === 'input_credit_card') carelessScore += 20;
        if (d.action === 'input_otp') carelessScore += 10;

        stats.scores.careless.total += carelessScore;
        stats.scores.careless.count++;
      }

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
        avgStayDuration:
          stats.totalCount > 0
            ? (stats.totalStay / stats.totalCount).toFixed(1)
            : "0.0",

        urlCheckRate:
          stats.totalCount > 0
            ? Math.round((stats.totalHover / stats.totalCount) * 100)
            : 0,
        totalAttempts: stats.totalCount,
        totalRiskScore,
        riskLevel,
        identificationRate: stats.totalCount > 0 ? Math.round((correctCount / stats.totalCount) * 100) : 100,
        typeStats,
        recentActions: actionLogs.slice(0, 10)
      }
    });
  } catch (e) {
    console.error('Stats error:', e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/generate-batch', async (req, res) => {
  try {

    const {
      scenario,
      difficulty,
      occupation,
      interests,
      userId
    } = req.body;

    const results = [];

    const types = [
      'phishing',
      'safe',
      'safe',
      'safe',
      'safe'
    ];

    // 洗牌
    types.sort(() => Math.random() - 0.5);

    for (const type of types) {

      const response = await fetch(
        `${req.protocol}://${req.get('host')}/api/phishing/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            scenario,
            difficulty,
            occupation,
            interests,
            userId,
            type
          })
        }
      );

      const email = await response.json();

      results.push(email);
    }

    res.json({
      success: true,
      count: 5,
      emails: results
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
api.js});

module.exports = router;
