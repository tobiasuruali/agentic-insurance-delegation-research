# ST02 Timing Data & Quality Flags Reference

**Study Version:** ST02 - Gallery with Product Highlight
**Variants:** ST02_01 (handoff), ST02_02 (no_handoff)
**Last Updated:** 2025-01-28

## Table of Contents
1. [Overview](#overview)
2. [Qualtrics Embedded Data Variables](#qualtrics-embedded-data-variables)
3. [ChatHistoryJson Event Log](#chathistoryjson-event-log)
4. [Temporal Data Collection Scenarios](#temporal-data-collection-scenarios)
5. [Data Quality Flags](#data-quality-flags)
6. [Analysis Quick Reference](#analysis-quick-reference)
7. [Setup Instructions](#setup-instructions)

---

## Overview

This document provides a comprehensive reference for all data collection in the ST02 study variant. It covers:
- What Qualtrics embedded data variables are collected and when
- What events are logged to ChatHistoryJson
- When timing data IS and ISN'T collected
- Data quality flag detection rules
- How to set up and analyze the data

---

## Qualtrics Embedded Data Variables

### Required Setup in Survey Flow

Add these variables **before** the chatbot question in Survey Flow. Leave all values empty - JavaScript will populate them automatically.

### Core Session Variables

| Variable Name | Type | When Set | Example Value | Notes |
|--------------|------|----------|---------------|-------|
| `SessionId` | String | On page load | `abc123xyz` | Auto-managed by 3-tier system |
| `CompositeSessionId` | String | On page load | `ST02_01_abc123_PROLIFIC123` | STUDY_ID + SessionID + PROLIFIC_PID |
| `ResponseID` | String | From Qualtrics | `R_3kX...` | Qualtrics response identifier |
| `TreatmentCondition` | String | On API request | `handoff` or `no_handoff` | Study condition |

### Conversation Data Variables

| Variable Name | Type | When Set | Example Value | Notes |
|--------------|------|----------|---------------|-------|
| `ChatHistory` | Text | On each message | `User: Hello\nBot: Hi there!` | Text format conversation log |
| `ChatHistoryJson` | JSON | On each event | `[{...}, {...}]` | Complete event log with timestamps |

### Product Decision Variables

| Variable Name | Type | When Set | Example Value | Notes |
|--------------|------|----------|---------------|-------|
| `RecommendedProduct` | Integer | On recommendation | `5` | Initially recommended product number |
| `AcceptedProduct` | String | On accept decision | `8` or `UNINSURED` | Product accepted or UNINSURED if declined |
| `WasRecommendationAccepted` | Boolean String | On accept decision | `true` or `false` | Whether recommendation was accepted |
| `UserJourney` | String | On decision | `direct-accept` | See user journey types below |
| `RecommendationType` | String | On recommendation | `single` or `gallery` | Interaction type |
| `RejectedRecommendation` | Integer | On gallery alternative | `5` | If user chose different product |
| `DeclinedProduct` | Integer | On decline | `5` | Product that was declined |

**User Journey Types:**
- `direct-accept` - Accepted from popup
- `decline-then-gallery-accept-recommended` - Declined popup, accepted same product from gallery
- `decline-then-gallery-accept-alternative` - Declined popup, accepted different product from gallery
- `decline-then-gallery-remain-uninsured` - Declined everything

### Gallery-Specific Variables

| Variable Name | Type | When Set | Example Value | Notes |
|--------------|------|----------|---------------|-------|
| `AcceptedProductDisplayPosition` | Integer | On gallery accept | `3` | 0-indexed position in randomized gallery |
| `RandomizedProductOrder` | String | On gallery open | `[5,2,8,1,...]` | Array of product numbers in display order |

### Timestamp Variables

| Variable Name | Type | When Set | Example Value | Notes |
|--------------|------|----------|---------------|-------|
| `PAGE_LOAD_TS` | ISO Timestamp | On page load | `2025-01-28T10:30:00.000Z` | When chatbot page loaded |
| `BOT_WELCOME_TS` | ISO Timestamp | On first bot message | `2025-01-28T10:30:01.500Z` | Initial welcome message sent |
| `USER_FIRST_MSG_TS` | ISO Timestamp | On first user message | `2025-01-28T10:30:05.200Z` | User sent first message |
| `RECOMMENDATION_RECEIVED_TS` | ISO Timestamp | On recommendation | `2025-01-28T10:31:00.000Z` | Recommendation received |
| `RECOMMENDED_PRODUCT_POPUP_TS` | ISO Timestamp | On popup first shown | `2025-01-28T10:31:00.500Z` | Recommendation popup opened |
| `PRODUCT_GALLERY_SHOWN_TS` | ISO Timestamp | On gallery first shown | `2025-01-28T10:31:20.000Z` | Product gallery opened |
| `GALLERY_FIRST_NAVIGATION_TS` | ISO Timestamp | On first gallery swipe/click | `2025-01-28T10:31:25.000Z` | User navigated in gallery |
| `RECOMMENDED_PRODUCT_DECISION_TS` | ISO Timestamp | On popup decision | `2025-01-28T10:31:15.000Z` | Accept or decline popup |
| `GALLERY_DECISION_TS` | ISO Timestamp | On gallery decision | `2025-01-28T10:31:45.000Z` | Final decision in gallery |
| `NEXT_BUTTON_TS` | ISO Timestamp | On Next button | `2025-01-28T10:32:00.000Z` | User clicked Next |

### Timing Duration Variables (NEW)

| Variable Name | Type | When Set | Example Value | Notes |
|--------------|------|----------|---------------|-------|
| `LAST_TIME_ON_RECOMMENDED_PRODUCT_MS` | Integer (ms) | On popup decision | `5000` | Most recent popup session only |
| `TOTAL_TIME_ON_RECOMMENDED_PRODUCT_MS` | Integer (ms) | On popup decision | `12000` | Cumulative across all popup sessions |
| `LAST_TIME_IN_GALLERY_MS` | Integer (ms) | On gallery decision | `8000` | Most recent gallery session only |
| `TOTAL_TIME_IN_GALLERY_MS` | Integer (ms) | On gallery decision | `15000` | Cumulative across all gallery sessions |
| `TOTAL_DECISION_TIME_MS` | Integer (ms) | On final decision | `45000` | From recommendation to final decision |

**Key Insight:** If `TOTAL > LAST`, user reopened popup/gallery at least once.

### Data Quality Variables (NEW)

| Variable Name | Type | When Set | Example Value | Notes |
|--------------|------|----------|---------------|-------|
| `DATA_QUALITY_FLAGS` | String | On each decision | `""` or `"short_attention,unusually_long_session"` | Comma-separated flags |

**Possible Flag Values:**
- Empty string `""` = Clean data
- `short_attention` = Decision made too quickly (< 1s popup, < 2s gallery)
- `unusually_long_session` = Very long session (> 5min popup, > 10min gallery)
- Combined: `"short_attention,unusually_long_session"` (multiple flags)

---

## ChatHistoryJson Event Log

The `ChatHistoryJson` variable contains a complete event log in JSON format. Each event has this structure:

```json
{
  "timestamp": "2025-01-28T10:30:00.000Z",
  "event": "event-name",
  "details": { ... }
}
```

### Event Types Logged

#### **1. Conversation Events**

**user-message**
```json
{
  "timestamp": "2025-01-28T10:30:05.200Z",
  "event": "user-message",
  "details": {
    "message": "I need home insurance"
  }
}
```

**bot-message**
```json
{
  "timestamp": "2025-01-28T10:30:06.500Z",
  "event": "bot-message",
  "details": {
    "message": "Great! Let me help you find the right coverage.",
    "agent": "information"
  }
}
```

#### **2. Recommendation Events**

**recommended-product-{N}**
```json
{
  "timestamp": "2025-01-28T10:31:00.000Z",
  "event": "recommended-product-5",
  "details": {
    "productNumber": 5,
    "type": "single",
    "reopenCount": 1
  }
}
```

**recommended-product-popup-reopened**
```json
{
  "timestamp": "2025-01-28T10:31:20.000Z",
  "event": "recommended-product-popup-reopened",
  "details": {
    "reopenCount": 2
  }
}
```

**recommended-product-popup-closed**
```json
{
  "timestamp": "2025-01-28T10:31:08.000Z",
  "event": "recommended-product-popup-closed",
  "details": {
    "timeViewedMs": 3000,
    "totalTimeMs": 3000
  }
}
```

#### **3. Decision Events**

**accepted-recommended-product-{N}**
```json
{
  "timestamp": "2025-01-28T10:31:15.000Z",
  "event": "accepted-recommended-product-5",
  "details": {
    "acceptedProduct": 5,
    "originalRecommendation": 5,
    "wasRecommended": true,
    "recommendationType": "single",
    "timeOnProductMs": 5000,
    "totalTimeOnProductMs": 12000
  }
}
```

**declined-recommended-product-{N}**
```json
{
  "timestamp": "2025-01-28T10:31:18.000Z",
  "event": "declined-recommended-product-5",
  "details": {
    "declinedProduct": 5,
    "originalRecommendation": 5,
    "wasRecommended": true,
    "recommendationType": "single",
    "timeOnProductMs": 3000,
    "totalTimeOnProductMs": 8000
  }
}
```

#### **4. Gallery Events**

**showed-product-gallery**
```json
{
  "timestamp": "2025-01-28T10:31:20.000Z",
  "event": "showed-product-gallery",
  "details": {
    "productCount": 16,
    "recommendedProduct": 5,
    "randomizedOrder": [5, 2, 8, 1, 12, 15, ...]
  }
}
```

**product-gallery-reopened**
```json
{
  "timestamp": "2025-01-28T10:31:35.000Z",
  "event": "product-gallery-reopened",
  "details": {
    "reopenCount": 2
  }
}
```

**product-gallery-closed**
```json
{
  "timestamp": "2025-01-28T10:31:30.000Z",
  "event": "product-gallery-closed",
  "details": {
    "timeViewedMs": 5000,
    "totalTimeMs": 5000
  }
}
```

**accepted-recommended-product-{N}** (from gallery)
```json
{
  "timestamp": "2025-01-28T10:31:45.000Z",
  "event": "accepted-recommended-product-5",
  "details": {
    "acceptedProduct": 5,
    "displayPosition": 0,
    "originalRecommendation": 5,
    "wasRecommended": true,
    "recommendationType": "gallery",
    "timeInGalleryMs": 8000,
    "totalGalleryTimeMs": 15000
  }
}
```

**accepted-alternative-product-{N}**
```json
{
  "timestamp": "2025-01-28T10:31:50.000Z",
  "event": "accepted-alternative-product-8",
  "details": {
    "acceptedProduct": 8,
    "displayPosition": 3,
    "originalRecommendation": 5,
    "wasRecommended": false,
    "recommendationType": "gallery",
    "timeInGalleryMs": 12000,
    "totalGalleryTimeMs": 18000
  }
}
```

**rejected-recommended-product-{N}**
```json
{
  "timestamp": "2025-01-28T10:31:50.000Z",
  "event": "rejected-recommended-product-5",
  "details": {
    "rejectedProduct": 5,
    "chosenInstead": 8,
    "chosenDisplayPosition": 3,
    "recommendationType": "gallery"
  }
}
```

**declined-all-products-from-gallery**
```json
{
  "timestamp": "2025-01-28T10:31:55.000Z",
  "event": "declined-all-products-from-gallery",
  "details": {
    "originalRecommendation": 5,
    "recommendationType": "gallery",
    "timeInGalleryMs": 10000,
    "totalGalleryTimeMs": 15000
  }
}
```

---

## Temporal Data Collection Scenarios

### ✅ Scenario 1: Direct Accept from Popup

**User Flow:** Opens popup → Accepts

**Data Collected:**
```
✅ RECOMMENDED_PRODUCT_DECISION_TS = timestamp
✅ LAST_TIME_ON_RECOMMENDED_PRODUCT_MS = sessionTime (e.g., 5000ms)
✅ TOTAL_TIME_ON_RECOMMENDED_PRODUCT_MS = sessionTime (e.g., 5000ms)
✅ TOTAL_DECISION_TIME_MS = calculated
✅ DATA_QUALITY_FLAGS = "" or "short_attention"

❌ GALLERY_DECISION_TS = not set
❌ LAST_TIME_IN_GALLERY_MS = not set
❌ TOTAL_TIME_IN_GALLERY_MS = not set
```

**ChatHistoryJson Events:**
1. `recommended-product-5`
2. `accepted-recommended-product-5`

**Relationship:** `TOTAL == LAST` (single session)

---

### ✅ Scenario 2: Decline Popup → Accept from Gallery

**User Flow:** Opens popup → Declines → Gallery opens → Accepts product

**Data Collected:**
```
✅ RECOMMENDED_PRODUCT_DECISION_TS = timestamp (from decline)
✅ LAST_TIME_ON_RECOMMENDED_PRODUCT_MS = popup sessionTime
✅ TOTAL_TIME_ON_RECOMMENDED_PRODUCT_MS = popup sessionTime
✅ GALLERY_DECISION_TS = timestamp
✅ LAST_TIME_IN_GALLERY_MS = gallery sessionTime
✅ TOTAL_TIME_IN_GALLERY_MS = gallery sessionTime
✅ TOTAL_DECISION_TIME_MS = calculated
✅ DATA_QUALITY_FLAGS = flags from both popup and gallery
```

**ChatHistoryJson Events:**
1. `recommended-product-5`
2. `declined-recommended-product-5`
3. `showed-product-gallery`
4. `accepted-recommended-product-5` OR `accepted-alternative-product-8`
5. (If alternative) `rejected-recommended-product-5`

**Relationship:** Both `TOTAL == LAST` (single session each)

---

### ✅ Scenario 3: Close Popup (X) → Reopen → Accept

**User Flow:** Opens popup → Closes (X) → Reopens → Accepts

**Data Collected:**
```
✅ RECOMMENDED_PRODUCT_DECISION_TS = timestamp (from accept)
✅ LAST_TIME_ON_RECOMMENDED_PRODUCT_MS = session2 time (most recent)
✅ TOTAL_TIME_ON_RECOMMENDED_PRODUCT_MS = session1 + session2
✅ TOTAL_DECISION_TIME_MS = calculated
✅ DATA_QUALITY_FLAGS = based on session2 only

❌ GALLERY timestamps = not set
```

**ChatHistoryJson Events:**
1. `recommended-product-5`
2. `recommended-product-popup-closed` (timeViewedMs: session1, totalTimeMs: session1)
3. `recommended-product-popup-reopened` (reopenCount: 2)
4. `accepted-recommended-product-5` (timeOnProductMs: session2, totalTimeOnProductMs: session1+session2)

**Relationship:** `TOTAL > LAST` indicates multiple sessions

**Key Insight:** Flags based on **most recent session only** (session2)

---

### ✅ Scenario 4: Decline Popup → Close Gallery (X) → Reopen Gallery → Accept

**User Flow:** Popup → Decline → Gallery → Close (X) → Reopen → Accept

**Data Collected:**
```
✅ RECOMMENDED_PRODUCT_DECISION_TS = from popup decline
✅ LAST_TIME_ON_RECOMMENDED_PRODUCT_MS = popup session
✅ TOTAL_TIME_ON_RECOMMENDED_PRODUCT_MS = popup session
✅ GALLERY_DECISION_TS = from gallery accept
✅ LAST_TIME_IN_GALLERY_MS = gallery session2 (most recent)
✅ TOTAL_TIME_IN_GALLERY_MS = gallery session1 + session2
✅ TOTAL_DECISION_TIME_MS = calculated
✅ DATA_QUALITY_FLAGS = accumulated flags
```

**ChatHistoryJson Events:**
1. `recommended-product-5`
2. `declined-recommended-product-5`
3. `showed-product-gallery`
4. `product-gallery-closed` (timeViewedMs: session1, totalTimeMs: session1)
5. `product-gallery-reopened` (reopenCount: 2)
6. `accepted-recommended-product-5` OR `accepted-alternative-product-8`

**Relationship:** Gallery `TOTAL > LAST` indicates multiple gallery sessions

---

### ✅ Scenario 5: Multiple Reopens (Complex)

**User Flow:** Open → Close (X) → Reopen → Close (X) → Reopen → Accept

**Data Collected:**
```
✅ LAST_TIME_ON_RECOMMENDED_PRODUCT_MS = session3 (most recent)
✅ TOTAL_TIME_ON_RECOMMENDED_PRODUCT_MS = session1 + session2 + session3
✅ DATA_QUALITY_FLAGS = based on session3 only
```

**ChatHistoryJson Events:**
1. `recommended-product-5`
2. `recommended-product-popup-closed` (timeViewedMs: session1)
3. `recommended-product-popup-reopened` (reopenCount: 2)
4. `recommended-product-popup-closed` (timeViewedMs: session2, totalTimeMs: session1+session2)
5. `recommended-product-popup-reopened` (reopenCount: 3)
6. `accepted-recommended-product-5` (totalTimeOnProductMs: session1+session2+session3)

**Key Insight:** Only **final session** determines flags, but **all sessions** contribute to TOTAL

---

### ❌ Edge Case 1: Close Popup (X) and Never Reopen

**User Flow:** Opens popup → Closes (X) → Navigates away / refreshes / abandons

**Data NOT Collected:**
```
❌ NO Qualtrics timing data stamped
❌ NO DATA_QUALITY_FLAGS
✅ Event logged to ChatHistoryJson: "recommended-product-popup-closed"
   → Contains timeViewedMs and totalTimeMs in event log only
```

**Why:** Close button (X) logs event but doesn't stamp to Qualtrics until decision made

**Detection:** Check ChatHistoryJson for `recommended-product-popup-closed` without subsequent decision event

---

### ❌ Edge Case 2: Close Gallery (X) and Never Reopen

**User Flow:** Popup → Decline → Gallery → Close (X) → Abandons

**Data Collected:**
```
✅ Popup timing data = stamped (from decline)
❌ NO gallery timing in Qualtrics variables
✅ Gallery event logged to ChatHistoryJson: "product-gallery-closed"
```

**Why:** Gallery X button logs event but doesn't stamp Qualtrics until decision made

**Detection:** `RECOMMENDED_PRODUCT_DECISION_TS` exists but no `GALLERY_DECISION_TS`

---

### ❌ Edge Case 3: Page Refresh After Popup Close (Before Decision)

**User Flow:** Popup → Close (X) → **Page Refreshes** → Reopens → Accepts

**Data Lost:**
```
❌ Session1 time LOST from TOTAL calculation
❌ In-memory counters reset: totalPopupTimeMs = 0
❌ ChatHistoryJson events LOST (not persisted across refresh)
```

**Data Collected:**
```
✅ LAST_TIME_ON_RECOMMENDED_PRODUCT_MS = session2 only
✅ TOTAL_TIME_ON_RECOMMENDED_PRODUCT_MS = session2 only (WRONG - underestimates)
❌ Cannot detect refresh occurred programmatically
```

**Impact:** Underestimates total consideration time

**Detection:** NOT POSSIBLE with current implementation

---

### ❌ Edge Case 4: Page Refresh After Gallery Close (Before Decision)

**User Flow:** Popup → Decline → Gallery → Close (X) → **Refresh** → Reopen gallery → Accept

**Data Lost:**
```
❌ Gallery session1 time LOST
❌ ChatHistoryJson events LOST
✅ Popup timing PRESERVED (decision was made before refresh)
```

**Data Collected:**
```
✅ LAST_TIME_ON_RECOMMENDED_PRODUCT_MS = preserved
✅ TOTAL_TIME_ON_RECOMMENDED_PRODUCT_MS = preserved
✅ LAST_TIME_IN_GALLERY_MS = session2 only
✅ TOTAL_TIME_IN_GALLERY_MS = session2 only (WRONG)
```

**Impact:** Gallery consideration time underestimated, popup data intact

**Detection:** Presence of `RECOMMENDED_PRODUCT_DECISION_TS` but no prior gallery events in ChatHistoryJson

---

## Data Quality Flags

### Flag Detection Rules

#### **Popup Decision Flags**

```javascript
// Popup accept or decline button
if (sessionTime < 1000 && sessionTime > 0) {
    flags.push('short_attention');  // < 1 second
}
if (sessionTime > 300000) {
    flags.push('unusually_long_session');  // > 5 minutes
}
```

**Thresholds:**
- `short_attention`: < 1000ms (1 second)
- `unusually_long_session`: > 300000ms (5 minutes)

#### **Gallery Decision Flags**

```javascript
// Gallery accept or decline button
if (sessionTime < 2000 && sessionTime > 0) {
    flags.push('short_attention');  // < 2 seconds
}
if (sessionTime > 600000) {
    flags.push('unusually_long_session');  // > 10 minutes
}
```

**Thresholds:**
- `short_attention`: < 2000ms (2 seconds)
- `unusually_long_session`: > 600000ms (10 minutes)

**Why different thresholds?** Gallery requires more time to navigate 16 products vs single popup.

### Flag Accumulation Logic

Flags accumulate across popup and gallery decisions:

```javascript
// Example flow:
// Popup: sessionTime = 500ms → flags.push('short_attention')
// Gallery: sessionTime = 650000ms → flags.push('unusually_long_session')
// Result: DATA_QUALITY_FLAGS = "short_attention,unusually_long_session"
```

**Important:** Flags are based on **session time**, not **total time**:
- Multiple reopens don't generate multiple flags
- Only the **most recent session** when each decision is made contributes to flags

### Flag Interpretation Matrix

| Popup Time | Gallery Time | Resulting Flags | Interpretation |
|------------|-------------|-----------------|----------------|
| 5000ms | N/A | `` | Clean - normal direct accept |
| 500ms | N/A | `short_attention` | Too fast - possible inattention |
| 350000ms | N/A | `unusually_long_session` | Very long - possible abandonment |
| 800ms | 1500ms | `short_attention,short_attention` | Both too fast |
| 4000ms | 1000ms | `short_attention` | Popup OK, gallery too fast |
| 500ms | 650000ms | `short_attention,unusually_long_session` | Fast popup, abandoned gallery |
| Multiple reopens | N/A | Based on last session only | Earlier sessions don't affect flags |

---

## Analysis Quick Reference

### Decision Tree for Data Quality

```
START: Review DATA_QUALITY_FLAGS

├─ IF FLAGS === "" (empty)
│  ├─ AND TOTAL === LAST
│  │  └─ ✅ Clean, single-session data - USE TOTAL
│  │
│  └─ AND TOTAL > LAST
│     └─ ✅ Clean, multi-session data - USE TOTAL
│        (User reopened but took time - normal deliberation)
│
├─ IF FLAGS contains "short_attention"
│  └─ ⚠️ Review or EXCLUDE participant
│     (Possible bot or inattentive user)
│
├─ IF FLAGS contains "unusually_long_session"
│  ├─ Check LAST_TIME value
│  ├─ IF LAST_TIME also very long
│  │  └─ ⚠️ EXCLUDE (likely abandoned tab)
│  └─ ELSE
│     └─ ⚠️ USE LAST_TIME instead of TOTAL
│        (Tab was left open in earlier session)
│
└─ IF TOTAL > LAST (no flags)
   └─ ✅ Normal multi-session behavior - USE TOTAL
      (Indicates deliberation/comparison shopping)
```

### Variable Relationship Guide

| Condition | Meaning | Recommendation |
|-----------|---------|----------------|
| `TOTAL == LAST` | Single session, no reopens | Use TOTAL (same as LAST) |
| `TOTAL > LAST` | Multiple sessions | Use TOTAL for full engagement |
| `TOTAL < LAST` | **IMPOSSIBLE** - Data error | Exclude from analysis |
| `TOTAL > LAST` with flags | Mixed behavior | Check flags, possibly exclude |
| Missing GALLERY variables with gallery journey | Data loss or error | Check ChatHistoryJson |

### Exclusion Criteria Recommendations

**Automatic Exclusions:**
1. `TOTAL < LAST` - Impossible value (data corruption)
2. Missing required timing variables for journey type
3. `TOTAL_DECISION_TIME_MS > 1800000` (30 minutes - likely abandoned)

**Flag for Manual Review:**
1. `DATA_QUALITY_FLAGS` contains `"short_attention"`
2. `DATA_QUALITY_FLAGS` contains `"unusually_long_session"`
3. `TOTAL_TIME` significantly different from `LAST_TIME` (e.g., >5x difference)
4. `TOTAL_TIME` values > 600000 (10 minutes)

**Keep for Analysis:**
1. `TOTAL > LAST` with no flags (normal reopen behavior)
2. Gallery reopens with reasonable times (comparison shopping)
3. Long but reasonable times (careful deliberation)

### Primary vs Secondary Metrics

**Most Reliable (Primary Metrics):**
- `UserJourney` - Categorical outcome, robust
- `WasRecommendationAccepted` - Binary, clearly defined
- `AcceptedProduct` - Product choice, unaffected by timing
- `DATA_QUALITY_FLAGS` - Direct quality indicator

**Use with Caution (Secondary Metrics):**
- `LAST_TIME_ON_RECOMMENDED_PRODUCT_MS` - More reliable than TOTAL
- `LAST_TIME_IN_GALLERY_MS` - More reliable than TOTAL
- Presence of gallery navigation - Binary indicator

**Interpret Carefully (Tertiary Metrics):**
- `TOTAL_TIME_ON_RECOMMENDED_PRODUCT_MS` - Affected by reopens, refreshes
- `TOTAL_TIME_IN_GALLERY_MS` - Affected by reopens, refreshes
- `TOTAL_DECISION_TIME_MS` - Can be inflated by multi-session behavior

---

## Setup Instructions

### Qualtrics Survey Flow Configuration

**1. Add Embedded Data Variables**

In Survey Flow, **before** the chatbot question, add these embedded data fields:

**Core Variables** (leave empty):
```
SessionId
CompositeSessionId
ResponseID
TreatmentCondition
ChatHistory
ChatHistoryJson
```

**Product Decision Variables** (leave empty):
```
RecommendedProduct
AcceptedProduct
WasRecommendationAccepted
UserJourney
RecommendationType
RejectedRecommendation
DeclinedProduct
```

**Gallery Variables** (leave empty):
```
AcceptedProductDisplayPosition
RandomizedProductOrder
```

**Timestamp Variables** (leave empty):
```
PAGE_LOAD_TS
BOT_WELCOME_TS
USER_FIRST_MSG_TS
RECOMMENDATION_RECEIVED_TS
RECOMMENDED_PRODUCT_POPUP_TS
PRODUCT_GALLERY_SHOWN_TS
GALLERY_FIRST_NAVIGATION_TS
RECOMMENDED_PRODUCT_DECISION_TS
GALLERY_DECISION_TS
NEXT_BUTTON_TS
```

**Timing Duration Variables** (leave empty):
```
LAST_TIME_ON_RECOMMENDED_PRODUCT_MS
TOTAL_TIME_ON_RECOMMENDED_PRODUCT_MS
LAST_TIME_IN_GALLERY_MS
TOTAL_TIME_IN_GALLERY_MS
TOTAL_DECISION_TIME_MS
```

**Data Quality Variables** (leave empty):
```
DATA_QUALITY_FLAGS
```

**2. Embed JavaScript Code**

In the chatbot question, add the appropriate JavaScript file as HTML:
- For handoff variant: `ST02_UI_highlight_gallery_handoff.js`
- For no_handoff variant: `ST02_UI_highlight_gallery_no_handoff.js`

**3. Update Configuration**

In the JavaScript file, update:
```javascript
var chatbotURL = "https://your-deployment-url.com";
var STUDY_ID = "ST02_01"; // or "ST02_02" for no_handoff
```

**4. Test Data Collection**

Preview survey and verify:
- All timing variables populate correctly
- `DATA_QUALITY_FLAGS` appears (empty or with flags)
- `ChatHistoryJson` contains event log
- Variables persist across pages

---

## Version History

- **v1.0** (2025-01-28): Initial documentation with timing variables and quality flags
  - Added LAST/TOTAL time distinction
  - Added DATA_QUALITY_FLAGS system
  - Documented all Qualtrics variables
  - Documented ChatHistoryJson events
  - Added analysis guidelines

---

## Related Documentation

- **[ST02_STUDY_DESIGN.md](ST02_STUDY_DESIGN.md)** - User journey maps and study design overview
- **[WORKFLOW.md](WORKFLOW.md)** - Complete system workflow documentation
- **[TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md)** - Technical implementation details
- **[README.md](../README.md)** - Project overview and setup instructions
