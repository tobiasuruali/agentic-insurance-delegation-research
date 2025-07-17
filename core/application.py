import os
import time
import json
from datetime import datetime
from typing import Dict, List
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler

import core.request_handler as request_handler

# Version number - update on redeploy
version_number = '1.0.0'

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Agentic Insurance Chatbot",
    description="A 2-agent insurance recommendation system",
    version=version_number
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Request/Response models
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str = None

class ChatRequest(BaseModel):
    message: List[ChatMessage]
    session_id: str
    qualtrics_response_id: str

class ChatResponse(BaseModel):
    response: str

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    logger.info("Health check request received")
    return HealthResponse(
        status="healthy",
        version=version_number,
        timestamp=datetime.utcnow().isoformat()
    )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Agentic Insurance Chatbot API",
        "version": version_number,
        "endpoints": {
            "health": "/health",
            "insurance_recommendation": "/InsuranceRecommendation",
            "local_ui": "/ui",
            "docs": "/docs"
        }
    }

# Main insurance recommendation endpoint
@app.post("/InsuranceRecommendation", response_model=ChatResponse)
async def insurance_recommendation(request: ChatRequest):
    """Main endpoint for insurance recommendation with 2-agent workflow"""
    logger.info(f"Received chat request for session: {request.session_id}")
    
    # Convert request to the format expected by request_handler
    request_data = {
        "message": [msg.dict() for msg in request.message],
        "session_id": request.session_id,
        "qualtrics_response_id": request.qualtrics_response_id
    }
    
    gpt_model = "gpt-4o"
    
    # Process the request
    result = request_handler.process_prompt_request(request_data, "/InsuranceRecommendation", gpt_model)
    
    # Handle the response
    if result.get('status_code') == 200:
        return ChatResponse(response=result['response'])
    else:
        raise HTTPException(
            status_code=result.get('status_code', 500),
            detail=result.get('error', 'Unknown error')
        )

# Local UI endpoint for development
@app.get("/ui", response_class=HTMLResponse)
async def local_ui():
    """Serve the local development UI interface"""
    html_content = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agentic Insurance Chatbot</title>
</head>
<body>
    <div id="chat-container" style="width: 100%; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>Agentic Insurance Chatbot</h1>
        <div id="chat-window" style="width: 100%; height: 400px; border: 1px solid #ccc; padding: 10px; overflow-y: scroll; margin-bottom: 10px; display: flex; flex-direction: column;">&nbsp;</div>
        <div style="display: flex; gap: 10px;">
            <input id="user-input" placeholder="Type your message here..." style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 14pt;" type="text" />
            <button id="send-button" style="padding: 10px 20px; background-color: #970000; color: white; border: none; border-radius: 5px; font-size: 14pt; cursor: pointer;">Send</button>
        </div>
    </div>
    <script src="/static/local-ui.js"></script>
</body>
</html>
    '''
    return HTMLResponse(content=html_content)

# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    logger.error(f"Internal server error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

# Run the application
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    logger.info(f"Starting the application on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)