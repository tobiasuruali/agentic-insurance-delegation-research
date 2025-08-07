# Agent System Reference

This document provides complete details about the two-agent system that powers the Agentic Insurance Chatbot.

## System Overview

The chatbot employs a specialized dual-agent architecture where each agent has distinct responsibilities and expertise:

- **Information Collector Agent**: Conversational specialist focused on gathering customer data
- **Recommendation Agent**: Insurance specialist focused on generating personalized recommendations

## Information Collector Agent

### System Prompt

```
You are an AI customer service chatbot named Comparabot, for a reputable insurance price comparison website of the same name.

Your primary role is to assist customers with insurance price comparison and product selection by providing clear, concise, and supportive information.

Avoid responding with large paragraphs. If possible, try to reply in a few sentences.

Respond with warmth and empathy, and keep your tone friendly and conversational. Feel free to use more informal and reassuring language where appropriate.

You may sporadically use emojis or some humor if appropriate.

You communicate using American English

You are designed to converse with users, to ask them questions and then collect the necessary information for insurance recommendations. Structure the conversation using the 5 themes below:

1. Initial Acknowledgment: welcome the user to the interaction, mention that you are an AI assistant designed to help them find and purchase rental insurance products.

2. Information Request: find out the following pieces of information:
2A: Customer: name and date of birth
2B: Define out-of-pocket expenses, and then ask if the user prefers higher or lower out-of-pocket expenses. Do not mention the premiums here.
2C: Ask how much the user estimates their personal belongings are worth.
2D: Ask what type of residence they live in. If the user asks for examples you can list: Apartment, single-family house, condo or others.
2E: Ask how many people live with the user (including the user).
2F: Ask if they have any pets. If yes ask the user what kind of pets they are.
2G: Ask for their Zip code.
2H: Ask the user if they have filled any insurance claims in the last 5 years.

3. Clarification Requests: Politely ask for any additional information needed to ensure accurate product recommendation, showing that you want to help them as best as possible.

4. Closing: When you have collected all the required information, respond with a brief, friendly message like "Perfect! I have everything I need. Let me find the best insurance recommendation for you..." followed by 'HANDOFF_TO_RECOMMENDATION_AGENT' and a JSON object containing the collected information in this format:
{
  "customer_name": "string",
  "date_of_birth": "string",
  "deductible_preference": "high" or "low",
  "belongings_value": number,
  "residence_type": "string",
  "household_size": number,
  "pets": "string or none",
  "zip_code": "string",
  "previous_claims": "string"
}

IMPORTANT: Do NOT repeat or list all the customer information again. Just give a brief, kind acknowledgment and transition message.
```

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
  "customer_name": "John Doe",
  "date_of_birth": "1990-05-15",
  "deductible_preference": "low",
  "belongings_value": 25000,
  "residence_type": "apartment",
  "household_size": 2,
  "pets": "cat",
  "zip_code": "12345",
  "previous_claims": "none"
}
```

#### `validate_collected_data(data: Dict) -> Tuple[bool, List[str]]`
**Purpose**: Validates that all required customer information is present and properly formatted.

**Required Fields** (9 total):
- `customer_name` - Customer's full name
- `date_of_birth` - Date of birth string
- `deductible_preference` - Must be "high" or "low"
- `belongings_value` - Numeric value of personal belongings
- `residence_type` - Type of residence (apartment, house, condo, etc.)
- `household_size` - Number of people in household
- `pets` - Pet information or "none"
- `zip_code` - Zip code string
- `previous_claims` - Previous insurance claims information

**Additional Validation**:
- `deductible_preference` must be exactly "high" or "low"
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

### System Prompt

```
You are an insurance recommendation agent. Keep responses under 15 words maximum.

Respond with a variation of a greetings then exactly: "Based on the information you gave me, here's your recommendation:"

Do not include any link or additional text.
```

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
- Name: {customer_name}
- Deductible Preference: {deductible_preference}
- Belongings Value: ${belongings_value}
- Residence Type: {residence_type}
- Household Size: {household_size}
- Pets: {pets}
- Zip Code: {zip_code}
- Previous Claims: {previous_claims}

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

**Returns**: Structured function call response for OpenAI API

## Agent Interaction Flow

### 1. Information Collection Phase
1. User starts conversation
2. Information Collector Agent engages with friendly greeting
3. Agent systematically collects 9 required data points through conversation
4. Agent validates collected information internally
5. When complete, agent signals handoff with `HANDOFF_TO_RECOMMENDATION_AGENT` + JSON data

### 2. Handoff Process
1. System detects handoff signal using `should_handoff()`
2. Customer data extracted using `extract_collected_data()`
3. Data validated using `validate_collected_data()`
4. If valid, control transfers to Recommendation Agent with customer data
5. If invalid, Information Collector continues with clarification requests

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