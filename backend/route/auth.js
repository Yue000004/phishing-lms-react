const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');


// 註冊
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      occupation,
      interests
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '缺少帳號或密碼'
      });
    }

    const existingUser = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (!existingUser.empty) {
      return res.status(400).json({
        success: false,
        error: '此 Email 已註冊'
      });
    }

    const docRef = await db.collection('users').add({
      name,
      email,
      password,
      gender,
      occupation,
      interests,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      userId: docRef.id
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// 登入
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const snapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({
        success: false,
        error: '帳號不存在'
      });
    }

    const doc = snapshot.docs[0];

    const user = {
      userId: doc.id,
      ...doc.data()
    };

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: '密碼錯誤'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;