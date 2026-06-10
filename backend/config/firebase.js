const admin = require("firebase-admin");

let db = null;

try {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: Buffer.from(
          process.env.FIREBASE_PRIVATE_KEY_BASE64,
          "base64"
        ).toString("utf-8"),
      }),
    });

    db = admin.firestore();
    
    console.log("KEY HAS REAL NEWLINE:", process.env.FIREBASE_PRIVATE_KEY.includes("\n"));
    console.log("KEY LENGTH:", process.env.FIREBASE_PRIVATE_KEY.length);
    console.log(
      "[Firebase] Admin SDK initialized successfully"
    );
  } else {
    console.warn(
      "[Firebase] Missing Firebase environment variables"
    );
  }
} catch (error) {
  console.error(
    "[Firebase] Initialization failed:",
    error.message
  );
}

module.exports = { admin, db };