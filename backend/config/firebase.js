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
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });

    db = admin.firestore();
    
    console.log("PROJECT ID:", process.env.FIREBASE_PROJECT_ID);
    console.log("CLIENT EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
    console.log("PRIVATE KEY START:", process.env.FIREBASE_PRIVATE_KEY?.slice(0, 30));
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