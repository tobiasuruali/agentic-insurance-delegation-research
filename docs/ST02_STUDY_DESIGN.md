# ST02 Study Design: Agentic Handoff in Insurance Recommendation

## Overview

ST02 is an experimental study investigating the effect of **agent handoff presentation** on user decision-making in an AI-powered insurance recommendation system. The study compares two treatment conditions:

- **Handoff Variant** (`ST02_01`): Multi-agent system with visible handoff animation and agent labeling
- **No-Handoff Variant** (`ST02_02`): Single-agent system with seamless recommendation delivery

Both variants provide identical recommendations and user journey options, differing only in the presentation of the agentic system.

---

## Study Variants

### Handoff Variant (ST02_01)

**Characteristics:**
- Two labeled agents: "Information Agent" → "Recommendation Agent"
- 11-second animated handoff sequence with visual indicators:
  - Step 1: "Handing over to Insurance Specialist" (200ms delay)
  - Step 2: "Thinking" (1750ms delay)
  - Step 3: "Getting top recommendation" (6000ms delay)
  - Final wait: 3000ms
- Distinct visual styling: Recommendation messages have blue background (#E8F4F8)
- "Agent Handoff" system divider displayed in conversation
- Backend flag: `show_handoff: true`

### No-Handoff Variant (ST02_02)

**Characteristics:**
- Single agent: "Information Agent" throughout
- No handoff animation or visual indicators
- Seamless recommendation delivery
- Consistent gray background (#F0F1F9) for all messages
- Backend flag: `show_handoff: false`

### What's Identical Across Variants

- Conversation flow and information collection
- Recommendation algorithm and product selection
- All 4 user journey paths (see below)
- Decision points and UI elements
- Product gallery features and randomization
- Tracking variables and data collection
- Exit conditions

---

## Complete User Journey Map

All users follow one of **4 possible journey paths**, determined by their interaction choices:

```
┌─────────────────────────────────────────────────────────────────┐
│                         START: Page Load                        │
│                     (BOT_WELCOME_TS recorded)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    Welcome Message Sent
                             │
                             ▼
                ┌────────────────────────┐
                │   User Conversation    │
                │ (Information Collection)│
                └────────────┬───────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │     HANDOFF vs NO-HANDOFF DIVERGENCE   │
        ├────────────────────────────────────────┤
        │  HANDOFF: 11-second animation sequence │
        │  NO-HANDOFF: Immediate delivery        │
        └────────────┬───────────────────────────┘
                     │
                     ▼
         RECOMMENDATION_RECEIVED_TS recorded
                     │
                     ▼
         User clicks recommendation link
                     │
                     ▼
         RECOMMENDED_PRODUCT_POPUP_TS recorded
         ┌──────────────────────────────────┐
         │   Recommendation Popup Displayed  │
         │                                   │
         │   Product Image                   │
         │   ✅ Accept Product               │
         │   ❌ Decline & Browse             │
         └───────────┬──────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   Accept Product           Decline & Browse
  (DECISION POINT 1)        (DECISION POINT 2)
        │                         │
        │                         ▼
        │            PRODUCT_GALLERY_SHOWN_TS recorded
        │            ┌─────────────────────────────┐
        │            │   Product Gallery           │
        │            │   (16 products randomized)  │
        │            │   Original highlighted      │
        │            │                             │
        │            │   ✅ Accept Product X       │
        │            │   ❌ Remain Uninsured       │
        │            └──────┬──────────────────────┘
        │                   │
        │          ┌────────┼────────┐
        │          │        │        │
        │          ▼        ▼        ▼
        │       Accept   Accept   Remain
        │       Original  Alt.   Uninsured
        │          │        │        │
        ▼          ▼        ▼        ▼
┌───────────────────────────────────────────────────────┐
│                  4 USER JOURNEYS                      │
├───────────────────────────────────────────────────────┤
│                                                       │
│  1. "direct-accept"                                   │
│     - Accept from popup immediately                   │
│     - WasRecommendationAccepted: "true"              │
│                                                       │
│  2. "decline-then-gallery-accept-recommended"        │
│     - Decline popup → Gallery → Accept original      │
│     - WasRecommendationAccepted: "true"              │
│                                                       │
│  3. "decline-then-gallery-accept-alternative"        │
│     - Decline popup → Gallery → Accept different     │
│     - WasRecommendationAccepted: "false"             │
│                                                       │
│  4. "decline-then-gallery-remain-uninsured"          │
│     - Decline popup → Gallery → Remain uninsured     │
│     - AcceptedProduct: "UNINSURED"                   │
│                                                       │
└───────────────────────┬───────────────────────────────┘
                        │
                        ▼
               NEXT_BUTTON_TS recorded
                        │
                        ▼
                  Survey Advances
                        │
                        ▼
                       END
```

---

## User Journey Descriptions

### Journey 1: "direct-accept"

**Path:** Conversation → Recommendation Popup → Accept

**User Behavior:**
- Receives recommendation popup
- Clicks "✅Accept Product" immediately
- No gallery browsing

**Outcome:**
- `UserJourney`: "direct-accept"
- `WasRecommendationAccepted`: "true"
- `AcceptedProduct`: Same as `RecommendedProduct`
- `RecommendationType`: "single"

**Timestamps Recorded:**
- `RECOMMENDATION_RECEIVED_TS`
- `RECOMMENDED_PRODUCT_POPUP_TS`
- `RECOMMENDED_PRODUCT_DECISION_TS`
- `TIME_ON_RECOMMENDED_PRODUCT_MS`
- `TOTAL_DECISION_TIME_MS`

---

### Journey 2: "decline-then-gallery-accept-recommended"

**Path:** Conversation → Recommendation Popup → Decline → Gallery → Accept Original

**User Behavior:**
- Receives recommendation popup
- Clicks "❌Decline & Browse"
- Gallery opens with 16 randomized products
- Navigates to originally recommended product (highlighted with gold border)
- Clicks "✅Accept Product"

**Outcome:**
- `UserJourney`: "decline-then-gallery-accept-recommended"
- `WasRecommendationAccepted`: "true"
- `AcceptedProduct`: Same as `RecommendedProduct`
- `AcceptedProductDisplayPosition`: Position in randomized order (1-16)
- `RecommendationType`: "gallery-after-decline"

**Timestamps Recorded:**
- All from Journey 1, plus:
- `PRODUCT_GALLERY_SHOWN_TS`
- `GALLERY_FIRST_NAVIGATION_TS` (if user navigated)
- `GALLERY_DECISION_TS`
- `TIME_IN_GALLERY_MS`

---

### Journey 3: "decline-then-gallery-accept-alternative"

**Path:** Conversation → Recommendation Popup → Decline → Gallery → Accept Alternative

**User Behavior:**
- Receives recommendation popup
- Clicks "❌Decline & Browse"
- Gallery opens with 16 randomized products
- Navigates to a **different** product (not the originally recommended one)
- Clicks "✅Accept Product"

**Outcome:**
- `UserJourney`: "decline-then-gallery-accept-alternative"
- `WasRecommendationAccepted`: "false"
- `AcceptedProduct`: **Different** from `RecommendedProduct`
- `AcceptedProductDisplayPosition`: Position in randomized order (1-16)
- `RejectedRecommendation`: Original product number
- `DeclinedProduct`: Original product number
- `RecommendationType`: "gallery-after-decline"

**Timestamps Recorded:**
- Same as Journey 2

**Additional Event:**
- Automatically logs `rejected-recommended-product-{N}` event

---

### Journey 4: "decline-then-gallery-remain-uninsured"

**Path:** Conversation → Recommendation Popup → Decline → Gallery → Remain Uninsured

**User Behavior:**
- Receives recommendation popup
- Clicks "❌Decline & Browse"
- Gallery opens with 16 randomized products
- Browses products (optional)
- Clicks "❌Remain Uninsured"

**Outcome:**
- `UserJourney`: "decline-then-gallery-remain-uninsured"
- `WasRecommendationAccepted`: "false"
- `AcceptedProduct`: "UNINSURED"
- `RecommendationType`: "gallery-after-decline"

**Timestamps Recorded:**
- Same as Journey 2

---

## Product Gallery Features

### Randomization

**Implementation:**
- All 16 products displayed in **randomized order** on first gallery open
- Randomization uses Fisher-Yates shuffle algorithm
- Order persists if gallery is reopened (stored in `shuffledProductOrder`)
- Randomized order saved in `RandomizedProductOrder` embedded data (JSON array)

**Purpose:**
- Eliminates position bias in product selection
- Allows analysis of display position effects
- Tracks both actual product number (1-16) AND display position (1-16)

### Visual Highlighting

**Originally Recommended Product:**
- Golden border (6px solid #FFD700)
- Badge: "Originally suggested"
- Maintains position in randomized carousel
- Easily identifiable among alternatives

**Product Display:**
- High-quality product sheet images
- Navigation: Previous/Next arrows + scroll support
- Position indicator: "X / 16"
- Dynamic accept button: "✅Accept Product X" (updates with carousel position)

### Navigation Tracking

**First Navigation:**
- `GALLERY_FIRST_NAVIGATION_TS` timestamp recorded on first arrow click or scroll
- Indicates user actively explored alternatives (vs. immediately accepting/declining)

**Carousel Behavior:**
- Syncs position on scroll and arrow clicks
- Smooth transitions between products
- Responsive to both mouse and keyboard input

---

## Decision Points

### Decision Point 1: Recommendation Popup

**Options:**

| Action | Result | Journey |
|--------|--------|---------|
| ✅ Accept Product | Advance to next question | "direct-accept" |
| ❌ Decline & Browse | Open product gallery | Continue to Decision Point 2 |
| ✕ Close popup | Return to chat | No decision recorded (can reopen) |

### Decision Point 2: Product Gallery

**Options:**

| Action | Result | Journey |
|--------|--------|---------|
| ✅ Accept (Original) | Advance to next question | "decline-then-gallery-accept-recommended" |
| ✅ Accept (Alternative) | Advance to next question | "decline-then-gallery-accept-alternative" |
| ❌ Remain Uninsured | Advance to next question | "decline-then-gallery-remain-uninsured" |
| ✕ Close gallery | Return to chat | No decision recorded (can reopen) |

---

## Tracking & Data Collection

### Embedded Data Variables (Qualtrics)

#### Session & Treatment
| Variable | Description | Values |
|----------|-------------|--------|
| `CompositeSessionId` | Unique session ID with study prefix | e.g., "ST02_01_SES_abc123__PROLIFIC__PID_xyz789" |
| `TreatmentCondition` | Study variant | "handoff" or "no_handoff" |
| `ResponseID` | Qualtrics response ID | Auto-generated |

#### Conversation
| Variable | Description | Format |
|----------|-------------|--------|
| `ChatHistory` | Full conversation text | String |
| `ChatHistoryJson` | Conversation with metadata | JSON array |

#### Recommendation & Decision
| Variable | Description | Values |
|----------|-------------|--------|
| `RecommendedProduct` | Initially recommended product | 1-16 |
| `AcceptedProduct` | Product user accepted | 1-16 or "UNINSURED" |
| `AcceptedProductDisplayPosition` | Position in randomized gallery | 1-16 |
| `WasRecommendationAccepted` | Did user accept recommendation? | "true" or "false" |
| `UserJourney` | Journey path taken | One of 4 journey names |
| `RecommendationType` | How recommendation was accepted | "single", "gallery", "gallery-after-decline" |
| `RejectedRecommendation` | Product rejected | 1-16 (if applicable) |
| `DeclinedProduct` | Product declined | 1-16 (if applicable) |
| `RandomizedProductOrder` | Gallery product order | JSON array [1-16] |

#### Timestamps (all in ISO 8601 format)
| Variable | When Recorded | Description |
|----------|---------------|-------------|
| `PAGE_LOAD_TS` | Page loads | Study start time |
| `BOT_WELCOME_TS` | Welcome message sent | Conversation start |
| `RECOMMENDATION_RECEIVED_TS` | Recommendation message received | **Handoff**: After 11s animation<br>**No-handoff**: Immediate |
| `RECOMMENDED_PRODUCT_POPUP_TS` | First popup open | User sees recommendation |
| `RECOMMENDED_PRODUCT_DECISION_TS` | User accepts/declines from popup | Decision from popup |
| `PRODUCT_GALLERY_SHOWN_TS` | First gallery open | Gallery browsing start |
| `GALLERY_FIRST_NAVIGATION_TS` | First navigation in gallery | User explores products |
| `GALLERY_DECISION_TS` | User accepts/declines from gallery | Decision from gallery |
| `NEXT_BUTTON_TS` | Next button clicked | Survey progression |

#### Duration Metrics (milliseconds)
| Variable | Calculation | Meaning |
|----------|-------------|---------|
| `TIME_ON_RECOMMENDED_PRODUCT_MS` | Time viewing popup | How long user considered initial recommendation |
| `TIME_IN_GALLERY_MS` | Time viewing gallery | How long user browsed alternatives |
| `TOTAL_DECISION_TIME_MS` | From RECOMMENDATION_RECEIVED_TS to decision | Total time to make final decision |

### Event Logging

All events logged to `chatHistoryJson` as system messages with type `event`:

**Recommendation Events:**
- `recommended-product-{N}`: Initial recommendation shown
- `recommended-product-popup-reopened`: Popup reopened

**Popup Decision Events:**
- `accepted-recommended-product-{N}`: Accepted from popup
- `declined-recommended-product-{N}`: Declined from popup
- `recommended-product-popup-closed`: Closed popup without deciding

**Gallery Events:**
- `showed-product-gallery`: Gallery displayed
- `product-gallery-reopened`: Gallery reopened
- `product-gallery-closed`: Closed gallery without deciding

**Gallery Decision Events:**
- `accepted-recommended-product-{N}`: Accepted original from gallery
- `accepted-alternative-product-{N}`: Accepted alternative from gallery
- `rejected-recommended-product-{N}`: Auto-logged when alternative accepted
- `declined-all-products-from-gallery`: Chose to remain uninsured

---

## Exit Conditions

### Successful Exits

**Product Accepted (Journeys 1, 2, 3):**
1. User clicks Accept button (popup or gallery)
2. Alert displayed: "You accepted product X!"
3. `NEXT_BUTTON_TS` recorded
4. `document.getElementById("NextButton").click()` triggered
5. Survey advances to next question

**Remain Uninsured (Journey 4):**
1. User clicks "Remain Uninsured" in gallery
2. Alert displayed: "Thank you for your feedback. You have declined all products."
3. `NEXT_BUTTON_TS` recorded
4. `document.getElementById("NextButton").click()` triggered
5. Survey advances to next question

### No Progression Without Decision

- Close buttons on popup/gallery do NOT advance survey
- User must make a final decision (accept product or remain uninsured)
- Can reopen popup/gallery multiple times before deciding
- Conversation interface provides no "skip" option

---

## Technical Implementation

### Backend Integration

**API Request:**
```javascript
{
    "message": userMessage,
    "session_id": compositeSessionId,
    "show_handoff": true/false  // Variant flag
}
```

**API Response:**
```javascript
{
    "response": [message1, message2]  // 2 messages indicates handoff
}
```

### Files

**Frontend:**
- `/static/ST02_UI_highlight_gallery_handoff.js` (Handoff variant)
- `/static/ST02_UI_highlight_gallery_no_handoff.js` (No-handoff variant)

**Backend:**
- `/core/request_handler.py` (Handoff detection logic)
- `/agents/information_collector.py` (Information collection)
- `/agents/recommendation_agent.py` (Recommendation generation)
- `/data/insurance_products.py` (Product selection and randomization)
- `/data/insurance_products.csv` (Product database)

### Product Images

16 professional product sheet images stored in Google Cloud Storage:
```
https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_01.png
...
https://storage.googleapis.com/images-mobilab/V3_product_sheets/V3_product_sheet_16.png
```

---

## Analysis Variables

### Primary Outcome Variables

| Variable | Type | Research Question |
|----------|------|-------------------|
| `WasRecommendationAccepted` | Binary | Does handoff increase acceptance of AI recommendation? |
| `UserJourney` | Categorical (4 levels) | How does handoff affect decision-making process? |
| `AcceptedProduct` | Categorical (17 levels) | What product do users ultimately choose? |

### Secondary Outcome Variables

| Variable | Type | Research Question |
|----------|------|-------------------|
| `TOTAL_DECISION_TIME_MS` | Continuous | Does handoff affect decision time? |
| `TIME_IN_GALLERY_MS` | Continuous | Does handoff affect exploration behavior? |
| `AcceptedProductDisplayPosition` | Integer (1-16) | Position bias in gallery selection? |
| `GALLERY_FIRST_NAVIGATION_TS` | Timestamp | Proportion who explore alternatives? |

### Experimental Manipulation Check

| Variable | Expected Difference |
|----------|---------------------|
| `RECOMMENDATION_RECEIVED_TS` | Handoff variant should show ~11 second delay |
| `TreatmentCondition` | "handoff" vs "no_handoff" |

---

## Edge Cases & Special Behaviors

### Popup/Gallery Reopen Behavior
- Both can be reopened multiple times via chat link (if backend provides it)
- Each reopen increments counter (`recommendationPopupOpenCount`, `galleryOpenCount`)
- Each reopen logs event (`recommended-product-popup-reopened`, `product-gallery-reopened`)
- Duration tracking resets on each open

### Navigation Without Decision
- User can close popup/gallery without deciding
- Returns to chat, can reopen later
- No journey logged until final decision made

### Gallery Randomization Consistency
- Products randomized on FIRST gallery open
- Order persists if gallery reopened (stored in `shuffledProductOrder` variable)
- Original recommendation maintains its position in randomized order
- Ensures consistent experience across multiple gallery views

### Display Position Tracking
- System tracks both:
  - **Original product number** (1-16): True product identity
  - **Display position** (1-16): Where in randomized carousel
- Enables analysis of position bias effects
- `AcceptedProductDisplayPosition` shows where in carousel user found product

### Conversation History Reload
- If user refreshes page, conversation history loaded from backend
- **Handoff variant**: Shows static "Handoff Complete" divider if handoff occurred
- **No-handoff variant**: Shows all messages as "Information Agent"
- Maintains conversation context across page refreshes

### Double-Click Prevention
- `isSending` flag prevents multiple simultaneous API calls
- Send button disabled during message processing
- Prevents duplicate messages and API errors

### Session ID Persistence
- Composite session ID stored in localStorage
- Format: `{STUDY_ID}_{SESSION_ID}__PROLIFIC__{PROLIFIC_PID}`
- Survives page refresh
- Links Qualtrics session with Prolific participant

---

## Research Hypotheses (Example)

### H1: Recommendation Acceptance
**Hypothesis:** The handoff variant will increase acceptance of AI recommendations compared to the no-handoff variant.

**Operationalization:**
- DV: `WasRecommendationAccepted` (true/false)
- IV: `TreatmentCondition` (handoff/no_handoff)
- Analysis: Chi-square test or logistic regression

### H2: Decision Process
**Hypothesis:** The handoff variant will decrease gallery browsing behavior (more direct acceptances).

**Operationalization:**
- DV: `UserJourney` distribution across 4 categories
- IV: `TreatmentCondition`
- Analysis: Multinomial logistic regression

### H3: Decision Time
**Hypothesis:** The handoff variant will increase decision time due to the handoff animation.

**Operationalization:**
- DV: `TOTAL_DECISION_TIME_MS`
- IV: `TreatmentCondition`
- Analysis: Independent samples t-test (controlling for animation duration)

---

## Future Enhancements

Potential extensions to the ST02 study design:

1. **Additional Treatments:**
   - Vary handoff animation duration
   - Test different agent personas/names
   - Compare single vs. multiple handoffs

2. **Enhanced Tracking:**
   - Eye-tracking integration during gallery browsing
   - Mouse movement heatmaps
   - Scroll depth in product images

3. **Alternative Outcomes:**
   - Post-decision satisfaction surveys
   - Confidence ratings in choice
   - Willingness to pay metrics

4. **Process Measures:**
   - Real-time confidence slider during browsing
   - Think-aloud protocols
   - Decision justification open-ended responses

---

## Contact & References

For questions about the ST02 study design or implementation:
- See main README.md for project overview
- Review SCALING_GUIDE.md for technical details
- Consult source code comments in ST02 JavaScript files

**Last Updated:** 2025-11-28
