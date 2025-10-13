# 📌 Agentic Insurance Chatbot — Project TODO
> **Last Updated:** January 2025  |  **Status:** Active Development

## 🔥 High Priority

<details><summary>🎨 UI</summary>

- [ ] **Mobile responsive design improvements:** fix carousel on mobile & touch‑swipe 🔥🎨 <!-- prio:high area:ui -->
- [ ] **Carousel view accept/decline button:** add accept & decline buttons to carousel 🔥🎨 <!-- prio:high area:ui -->
- [ ] **Popup sizing:** When wide screen, the popup for the caroussel suddenly fills the whole screen, should be smaller 🔥🎨 <!-- prio:high area:ui -->
-

</details>

<details><summary>💻 Backend</summary>

- [ ] **Prompt fool‑proofing:** handle edge cases & clarify the bot is an AI agent 🔥💻 <!-- prio:high area:logic -->
- [ ] **Move logging to internal only:** Refactor the backend logging to restrict output solely to internal streams. Replace direct console logging with a secure internal logging mechanism to ensure sensitive information isn't exposed while maintaining necessary debug traces. 🔥💻 <!-- prio:high area:logic -->

</details>

<details><summary>🛠️ Technical</summary>

- [ ] _None (placeholder)_ 🔥🛠️ <!-- prio:high area:technical -->

</details>

---

## 🔧 Nice‑to‑Have / Low Priority

<details><summary>🎨 UI</summary>

- [ ] **Restrict message sending and enforce auto-scroll:** Prevent sending a new message until a response is received, and automatically scroll the chat to the bottom when a new message is sent or received. 🧊🎨 <!-- prio:low area:ui -->

</details>

<details><summary>💻 Backend</summary>

- [ ] **Agentic Autogen hand‑off:** refactor backend logic for full agentic flow with AutoGen 🧊💻 <!-- prio:low area:logic -->

</details>

<details><summary>🛠️ Technical</summary>

- [ ] **Welcome message optimisation:** sample outputs to pick best greeting ( self-consistency or majority-vote/consensus decoding) 🧊🛠️ <!-- prio:low area:technical -->

</details>

---

## ✅ Recently Completed

- [x] **Handoff divider visualization:** implemented animated and static handoff dividers showing agent transitions ✅🎨
- [x] **Session persistence:** added Firestore-backed conversation storage with three-tier session ID management ✅💻
- [x] **Agent type tracking:** added explicit `agent_type` field to all assistant messages for proper styling ✅💻
- [x] **Conversation recovery:** implemented automatic loading and rendering of previous conversations on page refresh ✅🛠️
- [x] **Worker configuration:** made uvicorn worker count configurable via WORKERS environment variable ✅🛠️
- [x] **ES5 compatibility:** ensured all Qualtrics JavaScript uses ES5-compatible syntax (indexOf, var, etc.) ✅💻
- [x] **Documentation overhaul:** updated all documentation files (README, SCALING_GUIDE, WORKFLOW, TECHNICAL_REFERENCE, AGENT_SYSTEM) to reflect recent changes ✅📚
- [x] **Enhanced carousel navigation buttons:** bigger, branded, fixed overlap ✅🎨
- [x] **Modal improvements:** added close button & responsive sizing ✅🎨
- [x] **Simple decline workflow:** alternative UI removing carousel after decline ✅🎨
- [x] **Product sheet standardization:** renamed all product images to consistent `product_sheet_XX.jpg` format ✅🎨
- [x] **JavaScript URL updates:** updated all 5 JS files to use new standardized product image URLs ✅💻
- [x] **CSV product data conversion:** converted embedded product data to structured CSV with cell_id column ✅🛠️
- [x] **Water backup feature:** added 10th data collection point for water backup coverage preference ✅💻