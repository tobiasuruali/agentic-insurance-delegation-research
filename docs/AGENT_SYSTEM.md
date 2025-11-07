# Agent System Reference

This document provides complete details about the two-agent system that powers the Agentic Insurance Chatbot.

## System Overview

The chatbot employs a specialized dual-agent architecture where each agent has distinct responsibilities and expertise:

- **Information Collector Agent**: Focused on gathering customer data through conversational interaction
- **Recommendation Agent**: Focused on generating personalized insurance recommendations

## Information Collector Agent

### System Prompts

The Information Collector Agent has **two different system prompts** depending on the study condition. The prompts are nearly identical except for the closing/handoff section.

#### Handoff Version (system_prompts.yaml)

```
You are an AI customer service chatbot named Comparabot, for a reputable insurance price comparison website of the same name.

Your primary role is to assist customers with insurance price comparison and product selection by providing clear, concise, and supportive information.

Avoid responding with large paragraphs. If possible, try to reply in a few sentences.

Respond with warmth and empathy, and keep your tone friendly and conversational. Feel free to use more informal and reassuring language where appropriate.

You can sporadically use emojis and/or some humor if appropriate.

You communicate using American English

You are designed to converse with users, to ask them questions and then collect the necessary information for insurance recommendations. Structure the conversation using the 5 themes below:

1. Initial Acknowledgment (FIRST INTERACTION ONLY): If this is the very start of the conversation, welcome the user to the interaction. Then:
1A: State exactly: "I'm an AI system that helps you explore rental insurance options. I'm not a human, but I can assist you in comparing plans. Please review decisions carefully, and if in doubt, consult a qualified insurance professional."
1B: Briefly check if the user has any questions or queries regarding 1A. If they ask follow-up questions about AI, personal details OR off topic questions, acknowledge briefly but redirect focus to rental insurance information collection. If users express skepticism about AI assistance, acknowledge their perspective while emphasizing your ability to help compare options efficiently. If not, proceed onto next section.

IMPORTANT: If you have already provided the AI disclosure (1A) earlier in this conversation, do NOT repeat it. For simple greetings like "Hello" or "Hi" after the initial exchange, respond naturally and briefly (e.g., "How can I help you today?" or "Ready to continue?") and move directly to Section 2 to continue collecting information.

2. Information Request: find out the following pieces of information in this suggested order:
2A: Ask what type of residence they live in. If the user asks for examples you can list: Apartment, single-family house, condo or others.
2B: Ask how many people live with the user (including the user).
2C: Ask if they have any pets. If yes ask the user what kind of pets they are.
2D: Ask for their Zip code.
2E: Ask the user if they have filled any insurance claims in the last 5 years.
2F: Ask the user's age and confirm it's a number.
2G: Define out-of-pocket expenses, and then ask if the user prefers higher or lower out-of-pocket expenses. Do not mention the premiums here.
2H: Ask how much the user estimates their personal belongings are worth.
2I: Ask if they want coverage for water backup from sewers or drains.
2J: Validation and Incomplete Responses: If a user provides vague, incomplete, or unclear answers (like "maybe", "I don't know", or partial information), gently ask follow-up questions to get specific details needed for accurate recommendations. If the user hesitates to share their age, explain that it helps tailor the insurance estimate and that their details are used only for the quote.

3. Clarification and Gentle Persistence: When users hesitate or seem reluctant to provide required information, acknowledge their concerns with empathy. Explain that all information helps create the most accurate insurance recommendation for their specific situation. For privacy concerns, reassure that information is used solely for generating personalized quotes. If users resist providing personal details, gently explain that accurate recommendations require complete information, but remain supportive and patient throughout the process. When users express concerns about sharing personal information online, validate their caution as smart practice while explaining how this helps ensure they get coverage that fits their specific needs.

4. Closing: When you have collected all the required information, respond with a brief acknowledgment that you have all the details, then say: "I'm handing you over to our expert Recommendation Agent who specializes in policy selection." You may add a natural opening phrase before this, but the core handoff message must include the exact phrase about the expert Recommendation Agent specializing in policy selection. Put HANDOFF_TO_RECOMMENDATION_AGENT on its own line, followed immediately by raw JSON with no code fences or markdown. Use plain numbers (no commas or symbols) for belongings_value. Keys and values must exactly match the schema; use 'not provided' for optional fields you did not obtain. The JSON object should be in this format:
{
  "customer_age": "number",
  "deductible_preference": "high" or "low",
  "belongings_value": number,
  "water_backup_preference": "yes" or "no",
  "residence_type": "string",
  "household_size": number,
  "pets": "string or none",
  "zip_code": "string",
  "previous_claims": "string"
}

IMPORTANT: Do NOT repeat or list all the customer information again. Just give a brief, kind acknowledgment and transition message.
```

#### No Handoff Version (system_prompts_no_handoff.yaml)

The no_handoff version is identical to the handoff version **except** for section 4 (Closing):

**Section 4 - Closing (No Handoff):**
```
4. Closing: When you have collected all the required information, respond with a brief acknowledgment that you have all the details. Say something natural like: "Perfect! Let me find the best recommendation for you based on your answers." Then put HANDOFF_TO_RECOMMENDATION_AGENT on its own line, followed immediately by raw JSON with no code fences or markdown. Use plain numbers (no commas or symbols) for belongings_value. Keys and values must exactly match the schema; use 'not provided' for optional fields you did not obtain. The JSON object should be in this format:
{
  "customer_age": "number",
  "deductible_preference": "high" or "low",
  "belongings_value": number,
  "water_backup_preference": "yes" or "no",
  "residence_type": "string",
  "household_size": number,
  "pets": "string or none",
  "zip_code": "string",
  "previous_claims": "string"
}

IMPORTANT: Do NOT repeat or list all the customer information again. Just give a brief, kind acknowledgment and transition message. Do NOT mention handing over to another agent or specialist.
```

**Key Difference**: The no_handoff version explicitly instructs "Do NOT mention handing over to another agent or specialist" while the handoff version requires saying "I'm handing you over to our expert Recommendation Agent who specializes in policy selection."

### Core Functions

#### `should_handoff(response: str) -> bool`
**Purpose**: Detects when the agent wants to transfer control to the Recommendation Agent.

**Logic**: Simple string search for `'HANDOFF_TO_RECOMMENDATION_AGENT'` in the response.

**Returns**: Boolean indicating whether handoff should occur.

#### `extract_collected_data(response: str) -> Optional[Dict]`
**Purpose**: Extracts customer data from the handoff response.

**Process**:
1. Locates `HANDOFF_TO_RECOMMENDATION_AGENT` signal in response
2. Finds JSON object after the signal using bracket matching
3. Parses JSON containing customer data
4. Returns structured customer data dictionary

**Returns**: Customer data dictionary or `None` if parsing fails.

**Sample Output**:
```json
{
  "residence_type": "apartment",
  "household_size": 2,
  "pets": "cat",
  "zip_code": "12345",
  "previous_claims": "none",
  "customer_age": 34,
  "deductible_preference": "low",
  "belongings_value": 25000,
  "water_backup_preference": "yes"
}
```

#### `validate_collected_data(data: Dict) -> Tuple[bool, List[str]]`
**Purpose**: Validates that all required customer information is present and properly formatted.

**Required Fields** (9 total):
- `residence_type` - Type of residence (apartment, house, condo, etc.)
- `household_size` - Number of people in household
- `pets` - Pet information or "none"
- `zip_code` - Zip code string
- `previous_claims` - Previous insurance claims information
- `customer_age` - Customer's age as a positive number
- `deductible_preference` - Must be "high" or "low"
- `belongings_value` - Numeric value of personal belongings
- `water_backup_preference` - Must be "yes" or "no"

**Additional Validation**:
- `deductible_preference` must be exactly "high" or "low"
- `water_backup_preference` must be exactly "yes" or "no"
- `belongings_value` must be convertible to float

**Returns**: Tuple of (is_valid: bool, missing_fields: List[str])

#### `get_conversation_messages(conversation_history: List[Dict]) -> List[Dict]`
**Purpose**: Formats conversation history for OpenAI API consumption.

**Process**:
1. Adds system prompt as first message
2. Filters conversation history for 'user' and 'assistant' roles only
3. Formats each message with role and content
4. Logs message count and structure for debugging

**Returns**: List of messages in OpenAI API format

## Recommendation Agent

### System Prompts

The Recommendation Agent has **two different system prompts** depending on the study condition:

#### Handoff Version (system_prompts.yaml)

```
You are an insurance recommendation agent.

Respond with exactly: "Hi, I'm the Recommendation Agent. I specialize in renters insurance policies.

I've reviewed your answers to understand your overall preferences, what level of protection you are looking for, and how you want to balance price and coverage. I've used this information to match you to the policy options available here.

Based on that analysis, here is the policy that best fits your situation in this task:"

Do not include any link or additional text.
```

#### No Handoff Version (system_prompts_no_handoff.yaml)

```
You are an insurance recommendation agent.

Respond with exactly: "Thanks for sharing this information. Based on your answers, I've selected one policy option for you to review in this task:"

Do not include any link or additional text.
```

**Note**: The handoff version includes agent self-introduction and detailed explanation, while the no_handoff version provides a simpler, more direct transition.

### Core Functions

#### `process_customer_data(customer_data: Dict) -> Dict`
**Purpose**: Processes validated customer data to generate insurance recommendation.

**Process**:
1. Extracts key parameters (`deductible_preference`, `belongings_value`)
2. Calls `recommend_insurance_product()` with extracted parameters
3. Returns recommendation result with HTML link

**Returns**: Dictionary containing recommendation link and customer data

#### `get_conversation_messages(customer_data: Dict, recommendation_result: Dict) -> List[Dict]`
**Purpose**: Creates messages for OpenAI API to generate personalized recommendation response.

**Process**:
1. Formats customer information into structured user message
2. Includes recommendation link in the message
3. Combines with system prompt for OpenAI API call

**User Message Template**:
```
Customer Information:
- Residence Type: {residence_type}
- Household Size: {household_size}
- Pets: {pets}
- Zip Code: {zip_code}
- Previous Claims: {previous_claims}
- Age: {customer_age}
- Deductible Preference: {deductible_preference}
- Belongings Value: ${belongings_value}
- Water Backup Preference: {water_backup_preference}

Recommended Product Link: {recommendation_link}

Please provide a personalized response to the customer based on this information and include the recommendation link.
```

#### `create_function_call_response(customer_data: Dict) -> Dict`
**Purpose**: Creates OpenAI function calling structure for insurance recommendation.

**Function Definition**:
- **Name**: `recommend_insurance_package`
- **Parameters**: 
  - `deductible_preference`: "high" or "low"
  - `coverage_estimation`: Float value of belongings
  - `water_backup_preference`: "yes" or "no"

**Returns**: Structured function call response for OpenAI API

## Agent Interaction Flow

### 1. Information Collection Phase
1. User starts conversation
2. Information Collector Agent engages with friendly greeting
3. Agent systematically collects 10 required data points through conversation
4. Agent validates collected information internally
5. When complete, agent signals handoff with `HANDOFF_TO_RECOMMENDATION_AGENT` + JSON data

### 2. Handoff Process
1. System detects handoff signal using `should_handoff()`
2. Customer data extracted using `extract_collected_data()`
3. Data validated using `validate_collected_data()`
4. If valid, control transfers to Recommendation Agent with customer data
5. Backend attaches `customer_data` field to Information Collector's final message
6. Backend sets `agent_type: "collector"` for Information Collector messages
7. Backend sets `agent_type: "recommendation"` for Recommendation Agent messages
8. Frontend uses `customer_data` + `agent_type` to detect handoffs and display dividers
9. If invalid, Information Collector continues with clarification requests

**Key Backend Processing**:
```python
# Backend adds metadata to messages during handoff
for i, msg_content in enumerate(response_content):
    assistant_msg = {
        "role": "assistant",
        "content": msg_content,
        "timestamp": datetime.utcnow().isoformat(),
        "agent_type": "recommendation" if (is_handoff and i == 1) else "collector"
    }
    # Customer data attached only to collector's final message
    if is_handoff and i == 0:
        assistant_msg['customer_data'] = customer_data
    conversation_history.append(assistant_msg)
```

### 3. Recommendation Phase
1. Recommendation Agent receives validated customer data
2. Agent processes data using `process_customer_data()`
3. Insurance product recommendation generated via `recommend_insurance_product()`
4. Personalized response created using OpenAI API with customer context
5. Final recommendation with product link delivered to user

## Technical Implementation

### OpenAI API Integration
- **Model**: GPT-4o for all interactions
- **Function Calling**: Used in recommendation phase for product selection
- **Message Formatting**: Each agent handles its own OpenAI message structure
- **Context Management**: Customer data preserved across agent handoff

### Error Handling
- **JSON Parsing**: Graceful handling of malformed handoff data
- **Validation Failures**: Information Collector continues with missing field requests
- **API Errors**: Comprehensive error logging and fallback responses
- **Data Integrity**: Validation ensures recommendation quality

### Logging and Monitoring
- **Handoff Detection**: Logged when agents transfer control
- **Data Extraction**: Customer data parsing results logged
- **Validation Results**: Missing fields and validation status tracked
- **API Interactions**: Request/response patterns monitored for debugging

This dual-agent architecture ensures specialized expertise, clear separation of concerns, and robust error handling throughout the insurance recommendation process.