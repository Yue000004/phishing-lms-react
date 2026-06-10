# Fix Log: Behavior Tracking & Dashboard Refactor

## Issue: Inconsistent Tracking Data & Brittle Analytics
The project was suffering from data inconsistency in the `user_attempts` collection. Actions were recorded using a mix of Chinese, English, and natural language (e.g., `'成功防禦：回報釣魚'`, `'點擊連結'`). This led to:
1.  **Inaccurate Dashboard Stats:** Many user actions were being ignored or miscalculated.
2.  **Brittle Logic:** The backend relied on string matching of action names, which is prone to breaking.
3.  **Logical Errors:** Safe emails were being treated as risk factors even when users interacted with them correctly.

## Changes & Fixes

### 1. Frontend Action Standardization (`src/App.jsx`)
Standardized all tracking calls to use a fixed set of action keys and ensured `correct` and `isPhishing` fields are always sent.

-   **Mapped Actions:**
    -   `report_phishing` (Unified from `'成功防禦：回報釣魚'`, `'phishing'`)
    -   `mark_safe` (Unified from `'safe'`)
    -   `click_link` (Unified from `'點擊連結'`)
    -   `input_credit_card` (Standardized)
    -   `input_otp` (Standardized)
    -   `failed_phishing_test` (Standardized)
    -   `open_email` (Standardized)
    -   `recovery_success` / `recovery_fail` (Standardized)

-   **Field Consistency:** Added `correct: boolean` and `isPhishing: boolean` to all payloads.

### 2. Backend Analytics Refactor (`backend/route/phishing.js`)
Refactored the `/stats/:userId` endpoint to utilize the new structured data.

-   **Risk Calculation:**
    -   Logic changed to: `if (d.correct === true) risk = 0`.
    -   Risk points are now only added for failures (`correct === false`).
    -   Handles false-positives (reporting safe emails as phishing) as a specific risk factor.
-   **Identification Rate:**
    -   Now calculated based on the `correct` flag: `(correctCount / totalCount) * 100`.
-   **Psychological Dimension Analysis:**
    -   Updated Greed, Fear, Urgency, and Carelessness logic to use the explicit `isPhishing` and `correct` fields instead of deriving them from action strings.
-   **Robust Lookup:**
    -   Kept the dual-lookup (`emailId` or `emailSubject`) to handle legacy data and edge cases where IDs might be missing.

## Verification Result
-   **Network Traffic:** Confirmed payloads now correctly send `correct`, `isPhishing`, and standardized `action` names.
-   **Dashboard Accuracy:** Verified that correctly interacting with safe emails no longer increases risk scores and correctly increments the identification rate.
-   **Stability:** Removed multiple `try-catch` fallbacks that were previously needed to guess the email context.

---
*Date: June 10, 2026*
