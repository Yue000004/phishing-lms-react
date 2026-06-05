const admin = require("firebase-admin");
const { readFileSync } = require("fs");
const { join } = require("path");
require("dotenv").config({ path: join(__dirname, "../.env") });

let db = null;

try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./config/firebase-service-account.json";
  const absolutePath = join(__dirname, "..", serviceAccountPath);
  
  const serviceAccount = JSON.parse(readFileSync(absolutePath, "utf8"));

  // Robustness: Only initialize if private_key is not a placeholder
  if (serviceAccount.private_key && !serviceAccount.private_key.includes("YOUR_PRIVATE_KEY_HERE")) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log("[Firebase] Admin SDK initialized successfully");
  } else {
    console.warn("[Firebase] Service account contains placeholders. Firestore will not be available.");
  }
} catch (error) {
  console.error("[Firebase] Initialization failed:", error.message);
}

module.exports = { admin, db };
