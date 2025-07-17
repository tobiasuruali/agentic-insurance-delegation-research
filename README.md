# Agentic Insurance Chatbot

A 2-agent insurance recommendation system built with FastAPI, OpenAI, and Google Cloud. This system uses a structured agent workflow to collect user information and provide personalized insurance recommendations.

## Architecture

### Agent System
- **Agent 1 (Information Collector)**: Conducts structured conversations to gather customer information
- **Agent 2 (Recommendation Agent)**: Processes collected data to generate personalized insurance recommendations

### Tech Stack
- **Backend**: FastAPI with Python 3.10
- **AI/ML**: OpenAI GPT-4o-mini
- **Storage**: Google Cloud Storage (optional)
- **Deployment**: Docker + Google Cloud Run
- **Frontend**: JavaScript (Qualtrics compatible)

## Project Structure

```
agentic-insurance-chatbot/
├── agents/
│   ├── information_collector.py    # Agent 1: Data collection
│   └── recommendation_agent.py     # Agent 2: Insurance recommendations
├── core/
│   ├── application.py              # FastAPI application
│   ├── request_handler.py          # Agent orchestration
│   └── settings.py                 # Configuration
├── data/
│   ├── insurance_products.py       # Product data and logic
│   └── system_prompts.json         # Agent prompts
├── static/
│   ├── local-ui.js                 # Local development UI
│   └── UI_for_qualtrics.js        # Qualtrics integration
├── Dockerfile                      # Container configuration
├── compose.yaml                    # Docker Compose setup
├── requirements.txt                # Python dependencies
└── .env.example                    # Environment variables template
```

## Getting Started

### Prerequisites
- Python 3.10+
- Docker and Docker Compose
- OpenAI API key
- Google Cloud account (optional, for conversation storage)

### Local Development

1. **Clone and setup**
   ```bash
   cd agentic-insurance-chatbot
   cp .env.example .env
   ```

2. **Configure environment variables**
   ```bash
   # Edit .env file
   OPENAI_API_KEY=your_openai_api_key_here
   ENABLE_CONVERSATION_STORAGE=false  # Set to true for GCS storage
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Run with Python (alternative)**
   ```bash
   pip install -r requirements.txt
   python -m uvicorn core.application:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **Access the application**
   - Local UI: http://localhost:8000/ui
   - API docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

### Google Cloud Run Deployment

1. **Build and push container**
   ```bash
   # Build for Cloud Run
   docker build -t gcr.io/YOUR_PROJECT_ID/agentic-insurance-chatbot .
   
   # Push to Google Container Registry
   docker push gcr.io/YOUR_PROJECT_ID/agentic-insurance-chatbot
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy agentic-insurance-chatbot \
     --image gcr.io/YOUR_PROJECT_ID/agentic-insurance-chatbot \
     --platform managed \
     --region us-central1 \
     --set-env-vars OPENAI_API_KEY=your_key \
     --set-env-vars ENABLE_CONVERSATION_STORAGE=true \
     --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID \
     --set-env-vars GCS_BUCKET_NAME=your-bucket-name
   ```

3. **Update Qualtrics configuration**
   - Update `chatbotURL` in `static/UI_for_qualtrics.js`
   - Set to your Cloud Run service URL

## Usage

### API Endpoints

- `POST /InsuranceRecommendation` - Main chat endpoint
- `GET /health` - Health check
- `GET /ui` - Local development interface
- `GET /docs` - API documentation

### Chat Request Format
```json
{
  "message": [
    {
      "role": "user",
      "content": "Hello, I need insurance advice",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "session_id": "session_abc123",
  "qualtrics_response_id": "R_1234567890"
}
```

### Agent Workflow

1. **Information Collection Phase**
   - Agent 1 conducts structured conversation
   - Collects: name, DOB, deductible preference, belongings value, etc.
   - Validates completeness before handoff

2. **Recommendation Phase**
   - Agent 2 processes customer data
   - Generates personalized insurance recommendations
   - Returns HTML links to recommended products

## Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_api_key

# Optional - Google Cloud Storage
GOOGLE_CLOUD_PROJECT=your_project_id
GCS_BUCKET_NAME=your_bucket_name
ENABLE_CONVERSATION_STORAGE=false

# Application
PORT=8000
```

### Conversation Storage (Optional)
Enable Google Cloud Storage to persist conversation logs:
1. Create a GCS bucket
2. Set up service account with Storage Admin permissions
3. Configure environment variables
4. Set `ENABLE_CONVERSATION_STORAGE=true`

## Qualtrics Integration

1. **Upload JavaScript**
   - Use `static/UI_for_qualtrics.js` as code block
   - Update `chatbotURL` with your deployment URL

2. **Add Embedded Data Fields**
   - `ChatHistory` - Plain text conversation
   - `ChatHistoryJson` - Structured conversation data
   - `SessionId` - Session identifier
   - `ResponseID` - Qualtrics response ID

## Development

### Adding New Agents
1. Create agent class in `agents/` directory
2. Add system prompt to `data/system_prompts.json`
3. Update `core/request_handler.py` for orchestration
4. Register endpoints in `core/application.py`

### Customizing Insurance Products
- Edit `data/insurance_products.py`
- Modify recommendation logic in `recommend_insurance_product()`
- Update product images in static files

### Testing
```bash
# Run local development server
python -m uvicorn core.application:app --reload

# Test with curl
curl -X POST "http://localhost:8000/InsuranceRecommendation" \
  -H "Content-Type: application/json" \
  -d '{
    "message": [{"role": "user", "content": "Hello"}],
    "session_id": "test123",
    "qualtrics_response_id": "test456"
  }'
```

## Security Considerations

- Never commit API keys to version control
- Use environment variables for sensitive configuration
- Container runs as non-root user
- Enable conversation storage only when needed
- Configure CORS origins for production

## Cost Optimization

- **Cloud Run**: Pay-per-request pricing
- **OpenAI**: Monitor token usage via conversation storage
- **Storage**: Optional GCS usage for conversation logs
- **Scaling**: Auto-scales based on traffic

## Troubleshooting

### Common Issues
1. **OpenAI API errors**: Check API key and quotas
2. **Storage errors**: Verify GCS permissions and bucket existence
3. **Agent handoff issues**: Check conversation history format
4. **Docker build failures**: Ensure all dependencies in requirements.txt

### Debugging
- Enable debug logs: Set log level to DEBUG
- Check health endpoint: `/health`
- Review conversation storage for session data
- Use local UI for testing: `/ui`

## License

This project is licensed under the MIT License.