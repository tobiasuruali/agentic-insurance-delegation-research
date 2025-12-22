# Copilot Instructions for Agentic Insurance Chatbot

## Project Overview

This is a **dual-agent AI system** for personalized insurance recommendations designed for research and production use. The system demonstrates agentic AI architecture where two specialized agents collaborate:

1. **Information Agent (Comparabot)** - Collects customer data through warm, conversational interaction
2. **Recommendation Agent** - Generates personalized insurance recommendations with product links

The system is built with FastAPI, uses OpenAI's API for agent intelligence with function calling, and is production-ready for deployment to Google Cloud Run with Qualtrics survey integration. It supports multiple study variants (ST01, ST02) with different UI presentations and acceptance/decline workflows.

## Architecture & Key Components

### Core Structure
- **`core/application.py`** - FastAPI application entry point with endpoints and middleware
- **`core/request_handler.py`** - Handles message routing between agents
- **`core/settings.py`** - Configuration and environment variable management
- **`core/logging_config.py`** - Centralized logging setup

### Agents
- **`agents/information_collector.py`** - Information Agent (Comparabot) that validates and collects 9 required customer data points using warm, conversational language
- **`agents/recommendation_agent.py`** - Recommendation Agent that matches customers to insurance products using OpenAI function calling

### Data
- **`data/system_prompts.yaml`** - Agent system prompts and instructions (American English, warm conversational tone with empathy)
- **`data/insurance_products.py`** - Product recommendation logic with robust monotonic pricing guarantees
- **`data/insurance_products.csv`** - Product catalog (16 products) with pricing, coverage, and quality ranks

### Frontend & Study Variants
- **`static/local-ui.js`** - Local development UI with agent visual indicators
- **`static/ST00_UI_for_qualtrics.html`** - Base HTML template for Qualtrics integration
- **`static/ST01_UI_simple_decline_handoff.js`** - Study variant 1 with simple decline UI and agent handoff visible
- **`static/ST01_UI_simple_decline_no_handoff.js`** - Study variant 1 with simple decline UI, handoff hidden
- **`static/ST02_UI_highlight_gallery_handoff.js`** - Study variant 2 with gallery UI and agent handoff visible
- **`static/ST02_UI_highlight_gallery_no_handoff.js`** - Study variant 2 with gallery UI, handoff hidden

### Documentation
- **`docs/WORKFLOW.md`** - Complete workflow with mermaid diagrams and UI features
- **`docs/TECHNICAL_REFERENCE.md`** - Comprehensive technical reference for all functions and API flows
- **`docs/AGENT_SYSTEM.md`** - Agent system details, prompts, and validation logic
- **`docs/TODO.md`** - Project task tracking

## Coding Standards & Conventions

### Python Style
- Follow PEP 8 conventions
- Use type hints for function parameters and return values
- Use descriptive variable names (e.g., `deductible_preference`, `customer_data`)
- Keep functions focused and single-purpose
- Use docstrings for classes and complex functions

### Agent Tone & Language
- **Information Agent**: Warm, empathetic, conversational American English
- Use informal and reassuring language where appropriate
- May use emojis or gentle humor sparingly
- Avoid large paragraphs - keep responses to a few sentences
- Agent name: "Comparabot" for a rental insurance comparison website

### API & Response Conventions
- Use Pydantic models for request/response validation
- Return JSON responses with consistent structure
- Include proper error handling with HTTPException
- Log important events and errors using the configured logger
- ChatRequest model: `message` (list), `session_id` (str), `qualtrics_response_id` (str)
- ChatResponse model: Returns single message or array of messages for handoff
- OpenAI function calling: Recommendation agent uses `recommend_insurance_product()` tool with 3 parameters

### Agent Communication
- Agents communicate through structured messages
- Handoff trigger: `HANDOFF_TO_RECOMMENDATION_AGENT` followed by JSON customer data
- Required customer data fields: `customer_age`, `deductible_preference`, `belongings_value`, `water_backup_preference`, `residence_type`, `household_size`, `pets`, `zip_code`, `previous_claims`
- Information Agent responses: Warm and conversational, brief (few sentences)
- Recommendation Agent responses: Concise (under 15 words), includes product link
- Multi-message responses: System returns array during handoff with transition message + recommendation

### Environment Variables
- **Required**: `OPENAI_API_KEY` - OpenAI API key for agent functionality
- **Optional**: 
  - `ENABLE_CONVERSATION_STORAGE=false` - Enable logging to Google Cloud Storage
  - `GOOGLE_CLOUD_PROJECT` - GCP project ID
  - `GCS_BUCKET_NAME` - GCS bucket name (defaults to "insurance-chatbot-logs")
  - `PORT` - Application port (defaults to 8080 in Docker)

## Building & Testing

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
uvicorn core.application:app --host 0.0.0.0 --port 8001 --reload

# Access the UI
http://localhost:8001/ui
```

### Docker Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application
http://localhost:8080/ui
```

### Testing
- No automated test suite currently exists
- Manual testing through the chat UI is the primary validation method
- Test both agent handoff and recommendation generation flows
- Verify all 9 data collection points are properly gathered before handoff
- Test study variant UIs (ST01, ST02) with different handoff visibility settings
- Validate product recommendation logic with various customer preference combinations

## Dependencies & Technologies

### Core Technologies
- **Python 3.12** - Application runtime
- **FastAPI** - Web framework with OpenAPI documentation
- **Uvicorn** - ASGI server
- **OpenAI SDK** - Agent intelligence and function calling
- **Pydantic** - Data validation
- **PyYAML** - Configuration management
- **Pandas** - Product data handling

### Security Updates
- `fastapi>=0.111.0` - DoS vulnerability fix
- `python-multipart>=0.0.13` - ReDoS fix (CVE-2024-24762)
- `setuptools>=78.1.1` - Path-traversal/RCE fix (CVE-2025-47273)

### Cloud Services (Optional)
- **Google Cloud Storage** - Conversation logging
- **Google Cloud Run** - Production deployment

## Key Workflows

### Information Collection Flow (9 Required Data Points)
1. Initial acknowledgment - Welcome and explain AI assistant role for rental insurance
2. Check for questions about the AI assistant before proceeding
3. Collect data in suggested order:
   - Residence type (apartment, house, condo, etc.)
   - Household size (number of people including user)
   - Pets (type if yes)
   - Zip code
   - Previous insurance claims (last 5 years)
   - Customer age (must be a number)
   - Out-of-pocket preference (high/low) - define deductible concept first
   - Belongings value estimation
   - Water backup coverage preference (sewers/drains)
4. Clarification requests as needed
5. Closing with brief acknowledgment and handoff signal

### Agent Handoff Process
1. Information Agent collects all 9 required data points
2. Agent validates completeness of customer information
3. Agent responds with brief transition message: "Perfect! I have everything I need. Let me find the best insurance recommendation for you..."
4. Agent includes handoff signal: `HANDOFF_TO_RECOMMENDATION_AGENT` + JSON payload
5. System detects handoff signal and extracts customer data
6. System shows visual transition: "🔄 Connecting you with our Insurance Specialist..."
7. System transitions to Recommendation Agent with customer data
8. Recommendation Agent uses OpenAI function calling to generate product recommendation
9. System returns product link to user with concise message

### Product Recommendation Logic
- **Deductible mapping**: "low" out-of-pocket preference → $250 deductible; "high" → $1000 deductible
- **Coverage mapping**: belongings value ≥ $32,500 → $50k property limit; < $32,500 → $15k property limit
- **Water backup**: included or not based on user preference
- **Quality rank selection**: 50/50 randomization between Rank 1 and Rank 2 within matched coverage tier
- **Pricing monotonicity**: Base price (18) + coverage tier weight × 5 + rank delta (4 for Rank 2)
- **Coverage tier**: Sum of $250 deductible (+1), $50k property (+1), water backup (+1) = 0-3 points
- **Result**: 16 products with guaranteed pricing structure (more coverage = higher price)

## Important Considerations

### When Making Changes
- **Agent Prompts**: Stored in `data/system_prompts.yaml` - changes affect conversation flow and tone
- **Customer Data Schema**: If modifying required fields, update both agents, JSON schema in prompt, and validation logic
- **Product Logic**: Changes to recommendation algorithm in `data/insurance_products.py` require understanding of pricing tiers and monotonicity guarantees
- **Product Catalog**: 16 products in `data/insurance_products.csv` with columns: ProductNumber, Deductible, PropertyLimit, WaterBackup, Price, QualityRank, ProductLink
- **API Endpoints**: The `/chat` endpoint is the main entry point for conversations
- **Session Management**: Each conversation has a unique session ID; state stored in-memory
- **Study Variants**: UI changes should maintain embedded data variable population and analytics tracking

### Deployment Notes
- Application runs on port 8080 in Docker (configurable via PORT env var)
- Uses non-root user (`appuser`) for security in container
- CORS is configured to allow all origins (configure for production)
- Static files served from `/static` directory
- Health check endpoint available at `/health`
- Session state stored in-memory (conversations dictionary) - suitable for single-instance deployments
- For production scale (1000+ concurrent), consider Firestore-based session persistence for horizontal scaling

### Session Management
- In-memory conversation storage using dictionary: `{chatbot_id}_{session_id}: [messages]`
- Each session identified by unique session_id from frontend
- Conversations persist for duration of application runtime
- Optional GCS logging for conversation history (ENABLE_CONVERSATION_STORAGE=true)
- Error logs also stored to GCS when enabled for debugging

### Qualtrics Integration
- Requires embedded data variables in Survey Flow (add before chatbot question)
- Multiple UI variants available based on study design:
  - **ST00**: Base HTML template
  - **ST01**: Simple decline UI - basic product presentation with accept/decline
    - `ST01_UI_simple_decline_handoff.js` - Agent handoff visible to users
    - `ST01_UI_simple_decline_no_handoff.js` - Agent handoff hidden from users
  - **ST02**: Gallery UI - visual product sheets with highlight and gallery selection
    - `ST02_UI_highlight_gallery_handoff.js` - Agent handoff visible to users
    - `ST02_UI_highlight_gallery_no_handoff.js` - Agent handoff hidden from users

#### Required Embedded Data Variables
**Core Variables** (leave values empty - JavaScript populates automatically):
- `ChatHistory` - Full conversation log as text
- `ChatHistoryJson` - Structured conversation data as JSON
- `SessionId` - Unique session identifier
- `ResponseID` - Qualtrics response identifier

**Analytics Variables** (for tracking user behavior and choices):
- `RecommendedProduct` - Initial product number recommended by agent
- `AcceptedProduct` - Product number the user accepted
- `WasRecommendationAccepted` - Boolean string "true"/"false"
- `UserJourney` - Interaction flow tracking
- `RecommendationType` - Type of interaction
- `RejectedRecommendation` - Product number user rejected
- `DeclinedProduct` - Product number user declined

#### Integration Steps
1. Upload appropriate study variant JS file as embedded code block in Qualtrics
2. Configure embedded data fields in Survey Flow
3. Update `chatbotURL` variable in JS with your deployment endpoint
4. Set study conditions (handoff visibility, UI variant) in Survey Flow if using experimental design

## Code Quality & Style

### Logging
- Use the configured logger from `logging.getLogger(__name__)`
- Log level: INFO for normal operations, ERROR for exceptions
- Rotating file handler configured for log management

### Error Handling
- Use FastAPI's HTTPException for API errors
- Catch and log OpenAI API errors appropriately
- Validate customer data before processing recommendations
- Handle missing or invalid environment variables gracefully

### Documentation
- Update README.md for user-facing changes
- Update docs/WORKFLOW.md for workflow modifications (includes mermaid diagrams)
- Update docs/TECHNICAL_REFERENCE.md for technical changes (comprehensive function reference)
- Update docs/AGENT_SYSTEM.md for agent prompt or behavior changes
- Keep inline comments minimal but clear for complex logic

## Study Variants & Research Design

### UI Variants
The system supports multiple study variants for research purposes:

**ST01 - Simple Decline UI**:
- Basic product presentation with accept/decline buttons
- Minimal visual complexity
- Direct interaction pattern
- Available with/without visible agent handoff

**ST02 - Highlight Gallery UI**:
- Visual product sheets displayed as images
- Gallery of alternative products for exploration
- Highlight recommended product
- Rich visual presentation
- Available with/without visible agent handoff

### Handoff Visibility Control
Each study variant comes in two versions:
- **Handoff visible**: Shows system message "🔄 Connecting you with our Insurance Specialist..." and agent visual indicators
- **Handoff hidden**: Seamless single-agent experience from user perspective (backend still uses dual agents)

### Analytics Tracking
All variants track user journey and decisions:
- Initial recommendation from agent
- User acceptance/rejection/decline actions
- Product browsing behavior (gallery variants)
- Final product selection
- Conversation history and session data

## Common Tasks

### Adding a New Customer Data Field
1. Update the prompt in `data/system_prompts.yaml` (information_collector section)
2. Add field to collection order and closing JSON schema in the prompt
3. Add field to `required_fields` list in `InformationCollectorAgent` class
4. Update validation logic in `validate_collected_data()` method
5. Update recommendation logic in `data/insurance_products.py` if the field affects product matching
6. Test conversation flow manually to ensure field is collected properly

### Modifying Agent Behavior or Tone
1. Edit system prompt in `data/system_prompts.yaml`
2. For Information Agent: Maintain warm, empathetic, conversational American English
3. For Recommendation Agent: Keep concise (under 15 words) with product link
4. Test conversation flow manually through UI
5. Verify handoff still works correctly with JSON extraction
6. Ensure tone changes are consistent with Comparabot brand

### Changing Product Recommendations
1. Modify filtering logic in `data/insurance_products.py` `recommend_insurance_product()` function
2. Understand current pricing structure: Base(18) + Coverage_Tier(w)×5 + Rank_Delta(4)
3. Ensure pricing monotonicity is maintained (more coverage = higher price)
4. Test various customer preference combinations:
   - Low/high deductible preferences
   - Different belongings values around $32,500 threshold
   - With/without water backup
5. Verify product links are generated correctly in response
6. Check that randomization between Rank 1 and Rank 2 works properly

### Adding a New Study Variant
1. Copy existing variant JS file as template (e.g., ST02_UI_highlight_gallery_handoff.js)
2. Modify UI presentation logic for new experimental condition
3. Maintain embedded data variable population (ChatHistory, SessionId, analytics vars)
4. Create both handoff and no-handoff versions for consistency
5. Test with Qualtrics Survey Flow integration
6. Update README.md with new variant description and usage instructions
7. Document the variant's research purpose and differences

### Modifying Agent Prompts
1. Edit `data/system_prompts.yaml` for the specific agent
2. Information Agent: Follow 5-theme structure (acknowledgment, information request, clarification, closing, handoff)
3. Recommendation Agent: Maintain concise response format with product link
4. Preserve JSON schema format for handoff data structure
5. Test end-to-end flow to verify prompt changes work as expected
6. Update `docs/AGENT_SYSTEM.md` if significant changes to agent behavior

### Deployment to Cloud Run
1. Build and tag Docker image
2. Push to Google Artifact Registry
3. Deploy with required environment variables (OPENAI_API_KEY)
4. Configure optional GCS logging if needed
5. Verify health check endpoint responds correctly
