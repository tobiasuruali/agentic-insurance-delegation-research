# Copilot Instructions for Agentic Insurance Chatbot

## Project Overview

This is a **dual-agent AI system** for personalized insurance recommendations. The system demonstrates agentic AI architecture where two specialized agents collaborate:

1. **Information Agent** - Collects customer data through conversational interaction
2. **Recommendation Agent** - Generates personalized insurance recommendations

The system is built with FastAPI, uses OpenAI's API for agent intelligence, and can be deployed to Google Cloud Run or integrated with Qualtrics surveys.

## Architecture & Key Components

### Core Structure
- **`core/application.py`** - FastAPI application entry point with endpoints and middleware
- **`core/request_handler.py`** - Handles message routing between agents
- **`core/settings.py`** - Configuration and environment variable management
- **`core/logging_config.py`** - Centralized logging setup

### Agents
- **`agents/information_collector.py`** - Information Agent that validates and collects 9 required customer data points
- **`agents/recommendation_agent.py`** - Recommendation Agent that matches customers to insurance products

### Data
- **`data/system_prompts.yaml`** - Agent system prompts and instructions (American English, conversational tone)
- **`data/insurance_products.py`** - Product recommendation logic and matching algorithms
- **`data/insurance_products.csv`** - Product catalog with pricing and coverage details

### Frontend
- **`static/`** - HTML/CSS/JS for chat interface
- **`static/UI_for_qualtrics.js`** - Embeddable Qualtrics integration code

## Coding Standards & Conventions

### Python Style
- Follow PEP 8 conventions
- Use type hints for function parameters and return values
- Use descriptive variable names (e.g., `deductible_preference`, `customer_data`)
- Keep functions focused and single-purpose
- Use docstrings for classes and complex functions

### API & Response Conventions
- Use Pydantic models for request/response validation
- Return JSON responses with consistent structure
- Include proper error handling with HTTPException
- Log important events and errors using the configured logger

### Agent Communication
- Agents communicate through structured messages
- Handoff trigger: `HANDOFF_TO_RECOMMENDATION_AGENT` followed by JSON customer data
- Required customer data fields: `customer_age`, `deductible_preference`, `belongings_value`, `water_backup_preference`, `residence_type`, `household_size`, `pets`, `zip_code`, `previous_claims`
- Keep agent responses concise (Information Agent: conversational; Recommendation Agent: under 15 words)

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

### Agent Handoff Process
1. Information Agent collects all 9 required data points
2. Agent validates completeness of customer information
3. Agent responds with handoff message + JSON payload
4. System detects handoff signal and extracts customer data
5. System transitions to Recommendation Agent with customer data
6. Recommendation Agent uses OpenAI function calling to generate product recommendation
7. System returns product link to user

### Product Recommendation Logic
- Deductible mapping: "low" out-of-pocket preference → $250 deductible; "high" → $1000 deductible
- Coverage mapping: belongings value ≥ $32,500 → $50k coverage; < $32,500 → $15k coverage
- Water backup: included or not based on user preference
- Randomization: 50/50 selection between two product ranks within matched category

## Important Considerations

### When Making Changes
- **Agent Prompts**: Stored in `data/system_prompts.yaml` - changes affect conversation flow
- **Customer Data Schema**: If modifying required fields, update both agents and the JSON schema
- **Product Logic**: Changes to recommendation algorithm in `data/insurance_products.py` require understanding of pricing tiers
- **API Endpoints**: The `/chat` endpoint is the main entry point for conversations
- **Session Management**: Each conversation has a unique session ID for tracking

### Deployment Notes
- Application runs on port 8080 in Docker (configurable via PORT env var)
- Uses non-root user (`appuser`) for security in container
- CORS is configured to allow all origins (configure for production)
- Static files served from `/static` directory
- Health check endpoint available at `/health`

### Qualtrics Integration
- Requires embedded data variables in Survey Flow
- JavaScript code in `static/UI_for_qualtrics.js` handles integration
- Critical variables: `ChatHistory`, `SessionId`, `RecommendedProduct`, `WasRecommendationAccepted`

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
- Update WORKFLOW.md for workflow modifications
- Update TECHNICAL_REFERENCE.md for technical changes
- Keep inline comments minimal but clear for complex logic

## Common Tasks

### Adding a New Customer Data Field
1. Update the prompt in `data/system_prompts.yaml` (information_collector section)
2. Add field to `required_fields` list in `InformationCollectorAgent`
3. Update JSON schema in the prompt's closing section
4. Update recommendation logic if the field affects product matching

### Modifying Agent Behavior
1. Edit system prompt in `data/system_prompts.yaml`
2. Test conversation flow manually through UI
3. Verify handoff still works correctly
4. Ensure JSON extraction remains valid

### Changing Product Recommendations
1. Modify filtering logic in `data/insurance_products.py`
2. Ensure pricing monotonicity is maintained
3. Test various customer preference combinations
4. Verify product links are generated correctly

### Deployment to Cloud Run
1. Build and tag Docker image
2. Push to Google Artifact Registry
3. Deploy with required environment variables (OPENAI_API_KEY)
4. Configure optional GCS logging if needed
5. Verify health check endpoint responds correctly
