# Technical Function Reference - Agentic Insurance Chatbot

This document provides a comprehensive technical overview of all functions, API calls, and data flows in the agentic insurance chatbot system.

## System Architecture Overview

```
FastAPI App → Request Handler → Agent Classes → OpenAI API → Insurance Products → Response
```

## Complete Function Call Map

### 1. FastAPI Application Layer (`core/application.py`)

#### `insurance_recommendation(request: ChatRequest)`
**Entry Point for All Chat Interactions**
- **Input**: `ChatRequest` with message history, session_id, qualtrics_response_id
- **Process**: 
  1. Logs request details
  2. Converts to internal format
  3. Calls `request_handler.process_prompt_request()`
  4. Handles response formatting
- **Output**: `ChatResponse` with single or multiple messages
- **API Calls**: None (orchestration only)

```python
# Function signature
async def insurance_recommendation(request: ChatRequest) -> ChatResponse

# Internal call flow
request_data = {"message": [msg.dict() for msg in request.message], ...}
result = request_handler.process_prompt_request(request_data, "/InsuranceRecommendation", "gpt-4o")
```

### 2. Request Handler Layer (`core/request_handler.py`)

#### `get_conversation_history(conversation_key: str) -> List[Dict]`
**Conversation Retrieval with Firestore**
- **Input**: Conversation key (format: `"{chatbot_id}_{session_id}"`)
- **Process**:
  1. Checks if Firestore is enabled (`ENABLE_FIRESTORE_STORAGE`)
  2. If enabled: Retrieves conversation from Firestore document
  3. If disabled or error: Falls back to in-memory dictionary
  4. Returns empty list if conversation doesn't exist
- **Output**: List of message dictionaries with role, content, timestamp, agent_type
- **Firestore Path**: `conversations/{conversation_key}/history`

```python
# Usage example
conversation_key = f"{chatbot_id}_{session_id}"
history = get_conversation_history(conversation_key)
# Returns: [{"role": "user", "content": "...", "timestamp": "...", "agent_type": "collector"}, ...]
```

#### `save_conversation_history(conversation_key: str, conversation_history: List[Dict])`
**Conversation Persistence with Firestore**
- **Input**: Conversation key and full conversation history
- **Process**:
  1. Checks if Firestore is enabled
  2. If enabled: Saves/updates conversation document in Firestore
  3. If disabled or error: Falls back to in-memory storage
  4. Includes timestamp and session_id metadata
- **Output**: None (side effect: updates Firestore/memory)
- **Error Handling**: Graceful fallback to in-memory storage on Firestore errors

```python
# Firestore document structure
{
  'history': conversation_history,
  'updated_at': datetime.utcnow(),
  'session_id': conversation_key
}
```

#### `process_prompt_request(request_data: Dict, endpoint: str, gpt_model: str)`
**Main Orchestrator Function**
- **Input**: Request data, endpoint path, GPT model name
- **Process**:
  1. Extracts session info and conversation history
  2. Determines which agent to use
  3. Calls appropriate agent processing function
  4. Manages conversation history storage
  5. Handles logging and error storage
- **Output**: Dict with response content and status
- **Key Decision Point**: Routes to Information Collector or Recommendation Agent

```python
# Main decision logic
if last_assistant_msg and 'customer_data' in last_assistant_msg:
    result = process_with_recommendation_agent(customer_data, gpt_model)
else:
    result = process_with_information_collector(conversation_history, gpt_model)
```

#### `process_with_information_collector(conversation_history: List[Dict], gpt_model: str)`
**Information Collection Agent Processing**
- **Input**: Conversation history, GPT model
- **Process**:
  1. Calls `info_collector.get_conversation_messages()` to format for OpenAI
  2. Makes OpenAI API call
  3. Checks for handoff signal using `info_collector.should_handoff()`
  4. If handoff: extracts and validates customer data
  5. If handoff: immediately processes recommendation
- **Output**: Dict with success status, response(s), and optional customer data
- **API Calls**: 1-2 OpenAI chat completion calls

```python
# OpenAI API call
response = openai_client.chat.completions.create(
    model=gpt_model,
    messages=messages
)

# Handoff detection
if info_collector.should_handoff(response_content):
    customer_data = info_collector.extract_collected_data(response_content)
    recommendation_result = process_with_recommendation_agent(customer_data, gpt_model)
```

#### `process_with_recommendation_agent(customer_data: Dict, gpt_model: str)`
**Recommendation Agent Processing**
- **Input**: Customer data dictionary, GPT model
- **Process**:
  1. Calls `recommendation_agent.process_customer_data()` for initial processing
  2. Makes OpenAI API call with function calling enabled
  3. If tool_calls: executes `recommend_insurance_product()` function
  4. Makes second OpenAI API call for final response
  5. Ensures product link is included in response
- **Output**: Dict with success status and recommendation message
- **API Calls**: 2 OpenAI chat completion calls

```python
# Function calling setup
response = openai_client.chat.completions.create(
    model=gpt_model,
    messages=[{"role": "user", "content": "Generate insurance recommendation"}],
    tools=[{
        "type": "function",
        "function": {
            "name": "recommend_insurance_package",
            "description": "Recommends insurance package...",
            "parameters": {...}
        }
    }]
)

# Execute function call
if response.choices[0].finish_reason == 'tool_calls':
    args = json.loads(response.choices[0].message.tool_calls[0].function.arguments)
    result = recommend_insurance_product(args["deductible_preference"], args["coverage_estimation"], args["water_backup_preference"])
```

### 3. Agent Classes

#### Information Collector Agent (`agents/information_collector.py`)

##### `should_handoff(response: str) -> bool`
**Handoff Signal Detection**
- **Input**: AI response string
- **Process**: Simple string search for `HANDOFF_TO_RECOMMENDATION_AGENT`
- **Output**: Boolean indicating handoff intent

##### `extract_collected_data(response: str) -> Optional[Dict]`
**JSON Data Extraction from Handoff**
- **Input**: AI response containing handoff signal
- **Process**:
  1. Finds `HANDOFF_TO_RECOMMENDATION_AGENT` in text
  2. Locates JSON object after signal
  3. Parses JSON with bracket matching
  4. Returns structured customer data
- **Output**: Customer data dictionary or None

##### `validate_collected_data(data: Dict) -> Tuple[bool, List[str]]`
**Customer Data Validation**
- **Input**: Customer data dictionary
- **Process**: Validates all 9 required fields are present and valid
- **Required Fields** (in collection order):
  - `residence_type`, `household_size`, `pets`, `zip_code`, `previous_claims`
  - `customer_age`, `deductible_preference`
  - `belongings_value`, `water_backup_preference`
- **Output**: (is_valid: bool, missing_fields: List[str])

##### `get_conversation_messages(conversation_history: List[Dict]) -> List[Dict]`
**OpenAI Message Formatting**
- **Input**: Internal conversation history
- **Process**: Formats system prompt + conversation for OpenAI API
- **Output**: OpenAI-compatible message array

#### Recommendation Agent (`agents/recommendation_agent.py`)

##### `process_customer_data(customer_data: Dict) -> Dict`
**Customer Data Processing**
- **Input**: Validated customer data
- **Process**: Extracts key parameters and calls product recommendation
- **Function Call**: `recommend_insurance_product(deductible_preference, belongings_value, water_backup_preference)`
- **Output**: Dict with recommendation link and customer data

##### `get_conversation_messages(customer_data: Dict, recommendation_result: Dict) -> List[Dict]`
**Recommendation Message Formatting**
- **Input**: Customer data and recommendation result
- **Process**: Creates formatted message for OpenAI with customer context
- **Output**: OpenAI-compatible message array for final response generation

### 4. Insurance Product Logic (`data/insurance_products.py`)

#### `recommend_insurance_product(deductible_preference: str, coverage_estimation: float, water_backup_preference: str) -> str`
**Product Selection Algorithm**
- **Input**:
  - `deductible_preference`: "high" or "low"
  - `coverage_estimation`: Dollar value of belongings
  - `water_backup_preference`: "yes" or "no"
- **Process**:
  1. Maps deductible preference to risk aversion ($250 or $1000 deductible)
  2. Maps coverage estimation to belongings value category ($15k or $50k limit)
  3. Maps water backup preference to coverage inclusion
  4. Filters product database by all 3 criteria
  5. Selects product randomly from filtered results (Quality Rank 1 or 2)
  6. Generates HTML link with JavaScript callback
- **Output**: HTML link string for product recommendation

```python
# Product selection logic
deductible = 250 if (deductible_preference == "low") else 1000
coverage = 50000 if (coverage_estimation >= 32500) else 15000
water_backup = "Included" if (water_backup_preference == "yes") else "Not included"

filtered_products = df[
    (df['deductible'] == deductible) &
    (df['property_limit'] == coverage) &
    (df['water_backup'] == water_backup)
]

# Random selection between Quality Rank 1 and 2 in matching cell
selected_product = filtered_products.sample(n=1)
```

## Product Data Structure

### CSV-Based Product Database
The system now uses a structured CSV file (`data/insurance_products.csv`) instead of embedded data:

```csv
product_id,monthly_premium,deductible,property_limit,risk_aversion_Q1,belongings_value_Q2,water_backup,quality_rank,tier_w,cell_id
P1,18,1000,15000,Low,Low,Not included,1,0,D1000_P15_WB0
P2,22,1000,15000,Low,Low,Not included,2,0,D1000_P15_WB0
...
P16,37,250,50000,High,High,Included,2,3,D250_P50_WB1
```

### Key Features:
- **16 Products**: Complete matrix of deductible × coverage × water backup combinations
- **Cell-Based Structure**: Each unique combination (cell_id) contains 2 products with different Quality Ranks
- **Tier Calculation**: `tier_w = deductible_bonus + coverage_bonus + water_backup_bonus (0-3 scale)`
- **Pricing Logic**: `Price = base(18) + tier_w*5 + quality_rank_delta(4)`
- **Product Images**: Standardized naming `product_sheet_01.jpg` through `product_sheet_16.jpg`

### Pricing Structure:
- **Base Price**: $18/month minimum
- **Coverage Tiers**: 0-3 points based on feature combination
- **Quality Ranks**: 1 (better price) vs 2 (worse price within same coverage)
- **Monotonic Pricing**: More coverage always costs more

### Cell ID Format:
- **Pattern**: `D{deductible}_P{property_limit}_WB{water_backup_binary}`
- **Examples**:
  - `D1000_P15_WB0` = $1000 deductible, $15k coverage, no water backup
  - `D250_P50_WB1` = $250 deductible, $50k coverage, with water backup

## API Call Sequences

### Normal Conversation Flow
1. **FastAPI receives request** → `insurance_recommendation()`
2. **Route to Information Agent** → `process_with_information_collector()`
3. **OpenAI API Call #1** → Chat completion for information gathering
4. **Response processing** → Check for handoff signal
5. **Return single message** → Format and send to user

### Handoff Sequence Flow
1. **FastAPI receives request** → `insurance_recommendation()`
2. **Route to Information Agent** → `process_with_information_collector()`
3. **OpenAI API Call #1** → Chat completion (triggers handoff)
4. **Handoff detection** → `should_handoff()` returns True
5. **Data extraction** → `extract_collected_data()` parses JSON
6. **Data validation** → `validate_collected_data()` checks completeness
7. **Route to Recommendation Agent** → `process_with_recommendation_agent()`
8. **Product processing** → `process_customer_data()` + `recommend_insurance_product()` with 3 parameters
9. **OpenAI API Call #2** → Function calling for recommendation
10. **Function execution** → `recommend_insurance_product()` selects product based on deductible + coverage + water backup
11. **OpenAI API Call #3** → Final response generation
12. **Return multiple messages** → Array with transition + recommendation

### Error Handling Sequences
- **Validation Failure**: Return error message, continue information collection
- **OpenAI API Error**: Log error, return generic error message
- **JSON Parsing Error**: Log warning, request information again
- **Storage Error**: Log error, continue without storage

## Data Flow Tracking

### Request Structure Transformation
```python
# Frontend format
{
  "message": [{"role": "user", "content": "Hello", "timestamp": "..."}],
  "session_id": "session_123",
  "qualtrics_response_id": "response_456"
}

# Internal format (after conversion)
{
  "message": [{"role": "user", "content": "Hello", "timestamp": "..."}],
  "session_id": "session_123", 
  "qualtrics_response_id": "response_456"
}

# OpenAI API format
[
  {"role": "system", "content": "You are Comparabot..."},
  {"role": "user", "content": "Hello"}
]
```

### Conversation History Management

#### Storage Systems
- **Primary (Production)**: Firestore database for persistent, distributed storage
- **Fallback (Development)**: In-memory dictionary `conversation_histories[session_key]`
- **Key Format**: `f"{chatbot_id}_{session_id}"`
- **Toggle**: Controlled by `ENABLE_FIRESTORE_STORAGE` environment variable

#### Message Structure
Each message in conversation history contains:
- **role**: "user", "assistant", or "system"
- **content**: Message text content
- **timestamp**: ISO 8601 timestamp string
- **agent_type** (assistant messages only): "collector" or "recommendation"
- **customer_data** (handoff only): Customer information attached to collector's final message

```python
# Example conversation history
[
  {
    "role": "user",
    "content": "I need insurance for my apartment",
    "timestamp": "2025-01-13T10:00:00Z"
  },
  {
    "role": "assistant",
    "content": "Great! Let me help you...",
    "timestamp": "2025-01-13T10:00:05Z",
    "agent_type": "collector"
  },
  {
    "role": "assistant",
    "content": "Perfect! I have everything I need...",
    "timestamp": "2025-01-13T10:05:00Z",
    "agent_type": "collector",
    "customer_data": {
      "customer_age": 30,
      "deductible_preference": "low",
      "belongings_value": 25000,
      "water_backup_preference": "yes",
      ...
    }
  },
  {
    "role": "assistant",
    "content": "Based on your information, here's your recommendation: [LINK]",
    "timestamp": "2025-01-13T10:05:08Z",
    "agent_type": "recommendation"
  }
]
```

### Response Formatting
```python
# Single message response
{"response": ["Hello! How can I help you?"]}

# Multi-message response (handoff)
{"response": [
  "Perfect! Let me find the best recommendation...",
  "Based on the information you gave me, here's your recommendation: <link>"
]}
```

## Function Call Dependencies

```
FastAPI App
├── insurance_recommendation()
    └── request_handler.process_prompt_request()
        ├── process_with_information_collector()
        │   ├── info_collector.get_conversation_messages()
        │   ├── openai_client.chat.completions.create() [API Call #1]
        │   ├── info_collector.should_handoff()
        │   ├── info_collector.extract_collected_data()
        │   ├── info_collector.validate_collected_data()
        │   └── process_with_recommendation_agent() [if handoff]
        └── process_with_recommendation_agent()
            ├── recommendation_agent.process_customer_data()
            │   └── recommend_insurance_product()
            ├── openai_client.chat.completions.create() [API Call #2 - Function Calling]
            ├── recommend_insurance_product() [Function Execution]
            └── openai_client.chat.completions.create() [API Call #3 - Final Response]
```

## Integration Points

### Frontend-Backend Communication
- **Endpoint**: `POST /InsuranceRecommendation`
- **Request Format**: JSON with message array, session_id, qualtrics_response_id
- **Response Format**: JSON with response array (single or multiple messages)
- **Error Handling**: HTTP status codes + error details

### OpenAI API Integration
- **Model**: GPT-4o for all interactions
- **Rate Limiting**: Handled by OpenAI client
- **Function Calling**: Used for recommendation generation
- **Error Handling**: Try-catch with logging and fallback responses

### Google Cloud Storage Integration
- **Optional**: Controlled by `ENABLE_CONVERSATION_STORAGE` environment variable
- **Storage Functions**: `store_conversation_log()`, `store_error_log()`
- **File Format**: JSON with timestamp, session info, conversation history
- **Error Handling**: Graceful failure, system continues without storage

## Logging and Monitoring

### Key Log Points
1. **Request Reception**: Session ID, message count, content lengths
2. **Agent Routing**: Which agent is processing the request
3. **OpenAI Interactions**: Request/response content (truncated)
4. **Handoff Detection**: Signal detection and data extraction
5. **Product Recommendation**: Selected product and reasoning
6. **Error Conditions**: Full stack traces for debugging

### Storage Operations
- **Conversation Logs**: Complete interaction history for analysis
- **Error Logs**: Failed requests with full context for debugging
- **File Naming**: Includes chatbot ID, session ID, and Qualtrics response ID

## Enhanced Frontend Logging System

### Overview
The frontend UI files (`UI_for_qualtrics.js` and `UI_for_qualtrics_simple_decline.js`) implement a comprehensive logging system that tracks user interactions with product recommendations and captures detailed analytics data with **consistent data structure across all scenarios**.

### Core Logging Function

#### `logEvent(eventType: string, details: object)`
**Universal Logging Function with Consistent Data Structure**
- **Input**: Event type string and details object
- **Process**:
  1. Creates timestamped log entry in `chatHistoryJson`
  2. Updates `chatHistory` string for backward compatibility  
  3. Sets standard Qualtrics embedded data (ChatHistory, ChatHistoryJson, SessionId, ResponseID)
  4. **Retrieves current state** using `getJSEmbeddedData()` for all tracking variables
  5. **Updates specific variables** based on event type while preserving others
  6. **Always sets ALL 7 variables** to ensure consistent data structure
- **Output**: Updates both conversation history and complete embedded data set
- **Error Handling**: Graceful fallback with DEBUG mode for offline testing

```javascript
// Example usage
logEvent("recommended-product-3", {
    productNumber: 3,
    type: "single",
    recommendationType: "single"
});

// Always sets ALL variables:
// RecommendedProduct, AcceptedProduct, WasRecommendationAccepted, 
// UserJourney, RecommendationType, RejectedRecommendation, DeclinedProduct
```

### Consistent Data Structure Approach
**Critical Design Decision**: Every scenario produces identical 7-field embedded data structure.
- **Never Missing Fields**: All variables always present, using empty string `""` for non-applicable cases
- **State Preservation**: Uses `getJSEmbeddedData()` to maintain existing values across events
- **Analytics Friendly**: Consistent schema enables easy statistical analysis and database operations

### Tracking Variables
**Global State Management**
- `originalRecommendation`: Stores initially recommended product number
- `recommendationType`: Tracks interaction flow ("single", "gallery", "gallery-after-decline")

### Complete Embedded Data Variable Set

**ST01 (Simple) - 7 Core Variables:**
1. **`RecommendedProduct`**: Product number initially recommended (always has value)
2. **`AcceptedProduct`**: Product number accepted by user (value, `""`, or `"UNINSURED"`)
3. **`WasRecommendationAccepted`**: "true" if accepted recommended product, "false" otherwise
4. **`UserJourney`**: User flow type (e.g., "direct-accept", "declined-all-remain-uninsured")
5. **`RecommendationType`**: Interaction type (always has value)
6. **`RejectedRecommendation`**: Product number that was rejected (value or `""`)
7. **`DeclinedProduct`**: Product number that was declined (value or `""`)

**ST02 (Gallery) - 20+ Variables:**

*Core Variables:*
- `ChatHistory`, `ChatHistoryJson`, `SessionId`, `CompositeSessionId`, `ResponseID`
- `TreatmentCondition` - "handoff" or "no_handoff"

*Product Decision Variables (same as ST01):*
- `RecommendedProduct`, `AcceptedProduct`, `WasRecommendationAccepted`
- `UserJourney`, `RecommendationType`, `RejectedRecommendation`, `DeclinedProduct`

*Gallery-Specific Variables:*
- `AcceptedProductDisplayPosition` - Position where accepted product appeared in gallery
- `RandomizedProductOrder` - Randomized order of products shown
- `TIME_IN_GALLERY_MS` - Time spent in gallery view (milliseconds)
- `TIME_ON_RECOMMENDED_PRODUCT_MS` - Time viewing recommended product (milliseconds)

*Timestamp Variables:*
- `WINDOW_OPEN_TS` - Page load time
- `INIT_MSG_TS` - Initial message sent
- `FIRST_MSG_TS` - User's first message
- `NEXT_CLICK_TS` - Next button clicked
- `RECOMMENDATION_RECEIVED_TS` - Recommendation received
- `RECOMMENDED_PRODUCT_DECISION_TS` - Decision on recommended product
- `GALLERY_DECISION_TS` - Final gallery decision
- `TOTAL_DECISION_TIME_MS` - Total decision time (milliseconds)

### Event Types and Logic

#### Recommendation Events
- **Event**: `"recommended-product-N"`
- **Logic**: Sets RecommendedProduct=N, RecommendationType="single", others preserved/empty

#### Direct Acceptance Events
- **Event**: `"accepted-recommended-product-N"`
- **Logic**: Sets AcceptedProduct=N, WasRecommendationAccepted="true", UserJourney based on context

#### Alternative Acceptance Events  
- **Event**: `"accepted-alternative-product-N"`
- **Logic**: Sets AcceptedProduct=N, WasRecommendationAccepted="false", UserJourney="decline-then-gallery-accept"

#### Rejection Events
- **Event**: `"rejected-recommended-product-N"` (carousel version)
- **Logic**: Sets RejectedRecommendation=N, DeclinedProduct=N

- **Event**: `"declined-recommended-product-N"` (simple decline version)
- **Logic**: Sets AcceptedProduct="", WasRecommendationAccepted="false", UserJourney="decline-only", RejectedRecommendation=N, DeclinedProduct=N

#### Gallery Events
- **Event**: `"showed-product-gallery"`
- **Logic**: Updates RecommendationType to "gallery" or "gallery-after-decline"

### User Journey Values
**Standardized across both UI versions:**
- `"direct-accept"`: Accepted recommended product immediately
- `"gallery-accept-recommended"`: Saw gallery, chose originally recommended product
- `"decline-then-gallery-accept"`: Declined, saw gallery, chose different product  
- `"decline-only"`: Declined without choosing alternative (simple decline UI only)

### Complete Sample Output Data
**All scenarios show identical 7-field structure:**

#### Scenario 1: Direct Accept (Both UIs)
```json
{
  "ChatHistory": "System: recommended-product-3\nSystem: accepted-recommended-product-3",
  "ChatHistoryJson": "[{\"role\":\"system\",\"content\":\"recommended-product-3\",\"timestamp\":\"2025-07-30T10:15:30.123Z\",\"details\":{\"productNumber\":3,\"type\":\"single\"}}]",
  "RecommendedProduct": "3",
  "AcceptedProduct": "3", 
  "WasRecommendationAccepted": "true",
  "UserJourney": "direct-accept",
  "RecommendationType": "single",
  "RejectedRecommendation": "",
  "DeclinedProduct": "",
  "SessionId": "session_abc123",
  "ResponseID": "R_xyz789"
}
```

#### Scenario 2: Decline → Gallery → Accept Original (Main UI Only)
```json
{
  "ChatHistory": "System: recommended-product-3\nSystem: showed-product-gallery\nSystem: accepted-recommended-product-3",
  "ChatHistoryJson": "[detailed array with timestamps and context]",
  "RecommendedProduct": "3",
  "AcceptedProduct": "3",
  "WasRecommendationAccepted": "true",
  "UserJourney": "gallery-accept-recommended",
  "RecommendationType": "gallery-after-decline",
  "RejectedRecommendation": "",
  "DeclinedProduct": "",
  "SessionId": "session_def456",
  "ResponseID": "R_uvw012"
}
```

#### Scenario 3: Decline → Gallery → Accept Alternative (Main UI Only)
```json
{
  "ChatHistory": "System: recommended-product-2\nSystem: showed-product-gallery\nSystem: accepted-alternative-product-7\nSystem: rejected-recommended-product-2",
  "ChatHistoryJson": "[detailed array with timestamps and context]",
  "RecommendedProduct": "2",
  "AcceptedProduct": "7",
  "WasRecommendationAccepted": "false",
  "UserJourney": "decline-then-gallery-accept", 
  "RecommendationType": "gallery-after-decline",
  "RejectedRecommendation": "2",
  "DeclinedProduct": "2",
  "SessionId": "session_ghi789",
  "ResponseID": "R_abc345"
}
```

#### Scenario 4: Decline Only (Simple Decline UI Only)
```json
{
  "ChatHistory": "System: recommended-product-5\nSystem: declined-recommended-product-5",
  "ChatHistoryJson": "[detailed array with timestamps and context]",
  "RecommendedProduct": "5",
  "AcceptedProduct": "",
  "WasRecommendationAccepted": "false",
  "UserJourney": "decline-only",
  "RecommendationType": "single",
  "RejectedRecommendation": "5",
  "DeclinedProduct": "5",
  "SessionId": "session_jkl012",
  "ResponseID": "R_def678"
}
```

### Integration with Backend
- **Compatibility**: Fully backward compatible with existing backend
- **Data Flow**: Enhanced `chatHistoryJson` sent to backend maintains existing structure
- **Storage**: System events stored in conversation logs alongside agent messages
- **Analytics**: Embedded data variables provide structured analytics for external systems
- **Critical Note**: Potential conflicts if `sendMessage()` function has duplicate embedded data calls

### Implementation Differences

#### Main Version (`UI_for_qualtrics.js`)
- **Capabilities**: Carousel/gallery for alternative product selection
- **User Journeys**: 3 possible outcomes (direct-accept, gallery-accept-recommended, decline-then-gallery-accept)
- **Product Selection**: Always required - user must choose a product to proceed

#### Simple Decline Version (`UI_for_qualtrics_simple_decline.js`)  
- **Capabilities**: Binary accept/decline workflow only
- **User Journeys**: 2 possible outcomes (direct-accept, decline-only)
- **Product Selection**: Optional - user can completely reject without alternative

### Data Analysis Benefits
1. **Consistent Schema**: Every record has identical 7 fields for easy analysis
2. **No Missing Data**: Can query with `WHERE field != ""` instead of handling nulls
3. **Statistical Analysis**: Easy cross-tabulation and percentage calculations
4. **Database Ready**: Perfect for SQL joins and aggregations
5. **CSV Export**: Clean columnar data for spreadsheet analysis
6. **Machine Learning**: Consistent feature set for predictive models

### Troubleshooting
**Common Issues:**
- **No Backend Logs**: Check for duplicate `setJSEmbeddedData` calls in `sendMessage()` function
- **Inconsistent Data**: Ensure `logEvent()` is called for all user interactions
- **Missing Variables**: Verify all 7 variables are being set in every scenario
- **Cloud Run Connectivity**: Check CORS settings and network connectivity

This enhanced logging system provides rich analytics capabilities while maintaining full compatibility with the existing agentic architecture and ensuring consistent data structure for reliable analysis.

---

## Frontend Session Management and Handoff Visualization

### Session ID Management System

#### Three-Tier Session ID Strategy
The frontend implements a robust three-tier fallback system for session ID management in `ST01_UI_simple_decline_handoff.js` and other UI files:

```javascript
var sessionId = (function () {
    // Tier 1: Check Qualtrics embedded data (highest priority)
    var qualtricsSessionId = getQualtricsEmbeddedData('SessionId');
    if (qualtricsSessionId) {
        setStored(qualtricsSessionId);
        return qualtricsSessionId;
    }

    // Tier 2: Check localStorage
    var stored = getStored();
    if (stored) {
        return stored;
    }

    // Tier 3: Generate new session ID
    var generated = 'session_' + (crypto.randomUUID() || fallback);
    setStored(generated);
    setQualtricsEmbeddedData('SessionId', generated);
    return generated;
})();
```

**Priority Order:**
1. **Qualtrics Embedded Data** - Uses existing SessionId from Qualtrics survey flow
2. **localStorage** - Uses previously stored session from browser storage
3. **Generated UUID** - Creates new session using `crypto.randomUUID()` or timestamp-based fallback

**Benefits:**
- Ensures session continuity across page refreshes
- Works in Qualtrics environment with proper embedded data integration
- Falls back gracefully when Qualtrics is unavailable (local testing)
- Synchronized between localStorage and Qualtrics for consistency

### Conversation History Loading

#### `loadConversationHistory()`
**Purpose**: Loads and renders previous conversation from backend on page load

**Process**:
1. Constructs history endpoint: `{chatbotURL}/conversation/{sessionId}`
2. Fetches conversation history from backend
3. Populates `chatHistoryJson` and `chatHistory` variables
4. Renders each message with appropriate styling based on `agent_type`
5. Detects handoff points and inserts static dividers
6. If empty history: sends initialization request for welcome message

**Handoff Detection Logic**:
```javascript
// Check if current message has customer_data AND next message is recommendation
if (msg.customer_data && i + 1 < history.length) {
    var nextMsg = history[i + 1];
    var nextAgentType = nextMsg.agent_type ||
        (nextMsg.content.indexOf('showRecommendation(') !== -1 ? 'recommendation' : 'collector');

    if (nextAgentType === 'recommendation') {
        // Insert static handoff divider
        var handoffDivider = createStaticHandoffDivider();
        chatWindow.appendChild(handoffDivider);
    }
}
```

**Key Features:**
- ES5 compatible (uses `indexOf()` instead of `.includes()`)
- Explicit `agent_type` field with backward-compatible fallback
- Comprehensive debug logging for troubleshooting

### Handoff Divider Visualization

#### `createStaticHandoffDivider()`
**Purpose**: Creates a static, completed handoff divider for conversation history

**Returns**: DOM element representing completed handoff sequence

**Visual Structure**:
- Title: "Handoff Complete"
- Subtitle: "Routed to Insurance Specialist"
- Three completed steps with checkmarks:
  1. "Handing over to Insurance Specialist" ✓
  2. "Thinking" ✓
  3. "Getting top recommendation" ✓

```javascript
function createStaticHandoffDivider() {
    var handoverMessage = document.createElement('div');
    handoverMessage.className = 'message handover-message handover-complete';

    // ... creates step elements with completed state ...

    return handoverMessage;
}
```

#### `showHandoffSequence(chatWindow)`
**Purpose**: Shows animated handoff sequence during live agent transitions

**Process**:
1. Creates handoff message container with steps
2. Sequentially animates each step with staggered delays
3. Shows active state with spinning indicator
4. Marks previous steps as completed with checkmarks
5. **Total duration: ~10.8 seconds for full sequence (ST02)**

**Animation Stages (ST02 Current Timing)**:
```javascript
// Step 1: Activate after 200ms delay
Step 1: ACTIVE (spinning) → "Handing over to Insurance Specialist"

// Step 2: After 3.75s delay (was 1.75s)
Step 1: COMPLETED (checkmark) ✓
Step 2: ACTIVE (spinning) → "Thinking"

// Step 3: After 6.0s delay (was 4.0s)
Step 2: COMPLETED (checkmark) ✓
Step 3: ACTIVE (spinning) → "Getting top recommendation"

// Final: After 850ms
Step 3: COMPLETED (checkmark) ✓
All steps completed
```

**Timing Code (ST02_UI_highlight_gallery_handoff.js line 1500)**:
```javascript
await wait(i === 0 ? 200 : (i === 1 ? 3750 : 6000));
// Step 0: 200ms, Step 1: 3750ms, Step 2: 6000ms
// Total: 200 + 3750 + 6000 + 850 = 10,800ms (10.8 seconds)
```

**CSS Classes Used**:
- `.handover-step` - Base step styling
- `.handover-step.active` - Active step with spinner
- `.handover-step.completed` - Completed step with checkmark
- `.handover-complete` - Final state styling

### Message Rendering with Agent Types

#### `createMessageElement(role, content, agentType)`
**Purpose**: Creates styled message element with agent-specific colors and labels

**Parameters**:
- `role`: "user" or "assistant"
- `content`: Message text (may contain HTML links)
- `agentType`: "collector" or "recommendation" (optional, defaults to "collector")

**Visual Styling**:
```javascript
// Information Agent (collector)
Background: #F0F1F9 (light gray)
Border: rgba(60, 58, 189, 0.2) (purple)
Label: "Information Agent"

// Recommendation Agent
Background: #E8F4F8 (light blue)
Border: rgba(41, 118, 221, 0.3) (blue)
Label: "Recommendation Agent"
```

**ES5 Compatibility**:
- Uses `var` instead of `const/let`
- Uses `indexOf()` instead of `.includes()`
- Uses `document.createElement()` instead of template literals
- Manual DOM manipulation instead of `innerHTML` (Qualtrics safety)

This comprehensive session management and visualization system ensures reliable conversation continuity and clear agent transitions across all environments (Qualtrics, local development, production).

---

This technical reference provides a complete map of the system's internal operations, making it easy to understand where each process occurs and how data flows through the entire agentic architecture.