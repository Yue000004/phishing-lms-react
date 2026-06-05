const express = require('express');
const router = express.Router();
const { getModel } = require('../config/gemini');
const { db, admin } = require('../config/firebase');

/**
 * Task 2: 改寫後端生成 API 以支援「個性化動態情境」
 */
router.post('/generate', async (req, res) => {
  try {
    const { scenario, difficulty, occupation, interests } = req.body;
    const model = getModel();

    if (!model) {
      throw new Error('Gemini API 模型初始化失敗');
    }

    // 建立個性化上下文
    const profileContext = `
      【受害者個人輪廓】
      職業：${occupation || '一般職員'}
      感興趣的主題：${(interests && interests.length > 0) ? interests.join('、') : '日常社交與網購'}
    `;

    const prompt = `
      你是一位精通社會工程學、心理學與網路詐騙技術的頂尖駭客。
      請根據以下目標輪廓，量身打造一封「極度逼真」的正體中文 (zh-TW) 模擬釣魚郵件。
      
      【任務參數】
      情境目標：${scenario}
      難度等級：${difficulty} (低、中、高)
      ${profileContext}
      
      【生成規範】
      1. 個人化誘餌：必須將目標的「職業」工作流程或其「興趣」偏好深度融入信件內文。
      2. 心理學誘餌應用：根據情境隨機選擇並組合以下誘餌策略：
         - 【貪婪】：獎金發放、限時折扣、全額退款。
         - 【恐懼】：帳號停權警告、法務訴訟通知、未授權大額扣款。
         - 【好奇】：公司內部八卦文件、私人包裹追蹤、秘密邀請。
         - 【急迫】：系統 10 分鐘後關閉、最後 1 小時領取期限。
      3. 品牌偽造：模擬知名品牌（如 Netflix, GitHub, 銀行），但須微調名稱避開檢查（如 NetfIix, G0ogle）。
      4. 釣魚按鈕：內文必須包含一個明顯的按鈕或連結。
         - 此元素必須帶有 class="phishing-link" 屬性。
         - 網址請使用安全的測試網域（如: https://sandbox-phishing.com/verify）。
      5. 難度設定：
         - 低：破綻明顯（簡體字、語法生硬、網域極假）。
         - 高：語氣極度專業、破綻極細微（高仿網域）。

      【輸出格式】
      請務必回傳「純粹的 JSON 對象」，不要包含任何 Markdown 標記（如 \`\`\`json），也不要有任何開場白或結尾。格式必須完全符合：
      {
        "senderName": "偽造的寄件者顯示名稱",
        "senderEmail": "偽造的電子郵件地址",
        "subject": "具備強大吸引力或壓力的主旨",
        "bodyHtml": "完整郵件 HTML 內文（包含帶有 phishing-link 類別的按鈕）",
        "redFlags": ["破綻解析 1", "破綻解析 2"],
        "isPhishing": true
      }
    `;

    console.log(`[API] 正在為 ${occupation} 生成個人化郵件...`);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 強大 JSON 提取器
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI 回傳格式異常');
    
    const phishingData = JSON.parse(jsonMatch[0]);

    res.status(200).json({
      ...phishingData,
      id: 'ai-' + Date.now(),
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Gemini 產生失敗:', error.message);
    
    // Fallback: 智慧型保底
    try {
      const mockEmails = require('../../src/data/mockData.json');
      const { scenario } = req.body;
      const filtered = mockEmails.filter(e => 
        e.subject.includes(scenario) || e.senderName.includes(scenario)
      );
      const randomEmail = filtered.length > 0 ? filtered[0] : mockEmails[0];
      
      res.status(200).json({
        id: 'fallback-' + Date.now(),
        senderName: randomEmail.senderName,
        senderEmail: randomEmail.senderEmail,
        subject: randomEmail.subject,
        bodyHtml: randomEmail.content,
        isPhishing: randomEmail.isPhishing,
        redFlags: randomEmail.suspiciousElements || ["保底機制產生的信件"],
        isFallback: true
      });
    } catch (e) {
      res.status(500).json({ error: '系統無法生成信件', details: error.message });
    }
  }
});

/**
 * Task 3: Firebase 紀錄作答與行為路由
 */
router.post('/record', async (req, res) => {
  try {
    const { 
      userId, emailId, action, event, score, 
      mouseMovementCount, stayDuration, hoverChecked, hoveredUrls 
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: '缺少 userId' });
    }

    const attemptData = {
      userId,
      emailId: emailId || 'unknown_email',
      action: action || event || '未定義行為',
      score: score || 0,
      mouseMovementCount: mouseMovementCount || 0,
      stayDuration: stayDuration || 0,
      hoverChecked: !!hoverChecked,
      hoveredUrls: hoveredUrls || [],
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    if (db) {
      const docRef = await db.collection('user_attempts').add(attemptData);
      console.log(`[API] ✅ 行為數據已存入 Firebase, ID: ${docRef.id}`);
      res.status(200).json({ success: true, recordId: docRef.id });
    } else {
      console.warn('[API] Firebase 未連線，僅輸出 Log:', attemptData);
      res.status(200).json({ success: true, message: 'Offline mode: data logged only' });
    }
  } catch (error) {
    res.status(500).json({ error: '數據記錄失敗', details: error.message });
  }
});

/**
 * 儀表板數據分析路由
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!db) {
      return res.json({
        success: true,
        data: [
          { subject: '貪婪度', A: 20, fullMark: 100 },
          { subject: '恐懼感', A: 45, fullMark: 100 },
          { subject: '粗心度', A: 30, fullMark: 100 },
          { subject: '急迫感', A: 40, fullMark: 100 },
          { subject: '警覺性', A: 85, fullMark: 100 },
        ],
        summary: { avgStayDuration: "5.5", urlCheckRate: 20, totalAttempts: 1 }
      });
    }

    const snapshot = await db.collection('user_attempts')
      .where('userId', '==', userId)
      .get();

    if (snapshot.empty) {
      return res.json({ success: true, data: [], summary: { avgStayDuration: "0.0", urlCheckRate: 0, totalAttempts: 0 } });
    }

    let stats = { greed: 0, fear: 0, careless: 0, urgency: 0, awareness: 0, count: 0 };
    let totalStay = 0;
    let hoverCount = 0;

    snapshot.forEach(doc => {
      const d = doc.data();
      stats.count++;
      totalStay += (d.stayDuration || 0);
      if (d.hoverChecked) hoverCount++;
      
      const emailLower = (d.emailId || '').toLowerCase();
      if (d.action.includes('點擊') || d.action.includes('fail')) {
        if (emailLower.includes('獎') || emailLower.includes('贈')) stats.greed += 25;
        if (emailLower.includes('危險') || emailLower.includes('異常')) stats.fear += 25;
        if (d.stayDuration < 10) stats.careless += 30;
        stats.urgency += 20;
      } else {
        stats.awareness += 25;
      }
    });

    const chartData = [
      { subject: '貪婪度', A: Math.min(stats.greed, 100), fullMark: 100 },
      { subject: '恐懼感', A: Math.min(stats.fear, 100), fullMark: 100 },
      { subject: '粗心度', A: Math.min(stats.careless, 100), fullMark: 100 },
      { subject: '急迫感', A: Math.min(stats.urgency, 100), fullMark: 100 },
      { subject: '警覺性', A: Math.min(stats.awareness, 100), fullMark: 100 },
    ];

    res.status(200).json({
      success: true,
      data: chartData,
      summary: {
        avgStayDuration: (totalStay / stats.count).toFixed(1),
        urlCheckRate: Math.round((hoverCount / stats.count) * 100),
        totalAttempts: stats.count
      }
    });
  } catch (error) {
    res.status(500).json({ error: '分析失敗', details: error.message });
  }
});

module.exports = router;
