const admin = require("firebase-admin");

let db = null;
let firebaseReady = false;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });

    db = admin.firestore();
    firebaseReady = true;

    console.log("[Firebase] ✅ initialized");
  } else {
    console.warn("[Firebase] ⚠️ disabled (missing env)");
  }
} catch (err) {
  console.warn("[Firebase] ⚠️ disabled:", err.message);
}

module.exports = {
  admin,
  db,
  firebaseReady,
};