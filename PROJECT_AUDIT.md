# Project Audit: Phishing LMS Sandbox

## 1. Project Overview
This project is an AI-powered Phishing Learning Management System (LMS) designed to educate users about social engineering through immersive simulations. It uses a "Closed-Loop Education" model: **Simulate -> Fail -> Educate -> Recover**.

## 2. Technical Stack

### Frontend (React + Vite)
- **Framework:** React 18
- **Routing:** React Router 7
- **Styling:** Tailwind CSS + Typography plugin
- **Data Visualization:** Recharts (for Dashboard analytics)
- **Content Rendering:** React Markdown + Remark GFM (for AI-generated emails)
- **State Management:** React Context API (`UserContext`)

### Backend (Node.js + Express)
- **Engine:** Node.js + Express 5
- **Database:** Firebase Firestore (Admin SDK)
- **AI Engines:**
  - **Primary:** Gemini 2.5 Flash (Google Generative AI)
  - **Secondary:** Groq Llama 3.3 70B (Failover mechanism)

## 3. Core Features & Education Loop

### A. Immersive Simulation
- **Dynamic Content:** AI generates tailored phishing and safe emails based on user's occupation and interests.
- **RWD Interface:** Mimics a modern Gmail/Webmail interface with full responsive support.
- **Payload Simulation:** Includes simulated Payment Gateways, OTP Verification, and Virtual Phone interactions.

### B. The "Teachable Moment"
- **Triggered Feedback:** When a user falls for a phishing attempt, the system triggers a "Hacker Scare" screen and redirects to a **Recovery Drill**.
- **Teachable Modals:** Provides instant analysis of the phishing markers (Red Flags) the user missed.

### C. Analytics Dashboard
- **Psychological Profiling:** Analyzes user vulnerability across 4 dimensions: Greed, Fear, Urgency, and Carelessness.
- **Behavioral Logging:** Tracks stay duration, mouse movements, and URL hover checks.
- **Risk Assessment:** Calculates an overall risk level based on actual performance.

## 4. Refactoring Audit (June 2026)

### Standardized Behavior Tracking
- **The Problem:** Action names were inconsistent (mix of Chinese/English/Snake Case), leading to inaccurate dashboard stats.
- **The Solution:** Implemented a strict schema for `user_attempts`:
  - `action`: Standardized keys (e.g., `click_link`, `report_phishing`).
  - `correct`: Explicit boolean for success/failure.
  - `isPhishing`: Explicit context flag.
- **Impact:** Analytics logic moved from "String Matching" to "Boolean Logic," significantly increasing statistical accuracy and system robustness.

## 5. Security Architecture
- **Firebase Integration:** All user credentials and behavioral logs are secured via Firestore.
- **Dual AI Failover:** Backend automatically switches between Gemini and Groq if API limits are hit or service is down.
- **No-Live-Links:** All simulated phishing links are intercepted by the system and never lead to external malicious sites.

## 6. Recommendations & Roadmap
- [ ] **Multi-Language Support:** Expand AI prompts to support international phishing variants.
- [ ] **Email Attachments:** Add support for simulating macro-enabled documents or credential-stealing ZIP files.
- [ ] **AI Evolution:** Integrate Gemini 2.0 Pro for even more sophisticated social engineering scenarios.
- [ ] **Comparative Benchmarking:** Allow users to see how they rank against their industry peers.

---
*Audit conducted on: June 10, 2026*
