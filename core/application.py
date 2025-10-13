import os
import time
import json
from datetime import datetime
from typing import Dict, List
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler

# Initialize logging configuration
import core.logging_config  # noqa: F401

import core.request_handler as request_handler

# Version number - update on redeploy
version_number = '1.0.0'

# Load environment variables
load_dotenv()

# Configure logger for this module
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
    response: List[str]

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
    logger.info(f"Request message count: {len(request.message)}")
    
    # Log the request structure for debugging
    for i, msg in enumerate(request.message):
        logger.info(f"Message {i}: role={msg.role}, content_length={len(msg.content)}, timestamp={msg.timestamp}")
    
    # Convert request to the format expected by request_handler
    request_data = {
        "message": [msg.dict() for msg in request.message],
        "session_id": request.session_id,
        "qualtrics_response_id": request.qualtrics_response_id
    }
    
    gpt_model = "gpt-4.1"

    # Process the request (now async for better concurrency)
    result = await request_handler.process_prompt_request(request_data, "/InsuranceRecommendation", gpt_model)
    
    # Handle the response
    if result.get('status_code') == 200:
        # Support both single response and multiple responses
        response_data = result['response']
        logger.info(f"Response data type: {type(response_data)}")
        if isinstance(response_data, list):
            logger.info(f"Returning {len(response_data)} messages")
            return ChatResponse(response=response_data)
        else:
            logger.info(f"Returning single message: {response_data[:100]}...")
            return ChatResponse(response=[response_data])
    else:
        logger.error(f"Error response: status_code={result.get('status_code')}, error={result.get('error')}")
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
    <style>
        body {
            margin: 0;
            padding: clamp(0.5rem, 2vw, 1rem);
            font-family: 'Arial', sans-serif;
            background-color: #F6F5F2;
        }
        #input-row {
            display: flex;
            width: 100%;
            gap: clamp(8px, 2vw, 12px);
            box-sizing: border-box;
        }
        #user-input {
            flex: 1 1 auto;
            min-width: 0;
            box-sizing: border-box;
        }
        #send-button {
            flex: 0 0 auto;
        }
    </style>
</head>
<body>
    <div id="chat-container" style="width: clamp(320px, 95vw, 800px); margin: 0 auto; padding: clamp(1rem, 4vw, 1.5rem); box-sizing: border-box; max-width: 100%;">
        <h1>Agentic Insurance Chatbot</h1>
        <div id="chat-window" style="width: 100%; height: 50vh; border: 1px solid #ccc; padding: clamp(0.5rem, 2vw, 1rem); overflow-y: scroll; margin-bottom: clamp(0.5rem, 2vw, 1rem); display: flex; flex-direction: column; box-sizing: border-box;">&nbsp;</div>
        <div id="input-row" style="display: flex; width: 100%; gap: clamp(8px, 2vw, 12px); box-sizing: border-box;">
            <input id="user-input" placeholder="Type your message here..." 
                   style="flex: 1 1 auto; min-width: 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; padding: clamp(8px, 2vw, 12px); font-size: clamp(0.875rem, 2.5vw, 1rem); min-height: 44px;" type="text" />
            <button id="send-button" style="flex: 0 0 auto; background-color: #4B48EC; color: white; border: none; border-radius: 5px; cursor: pointer; padding: clamp(10px, 2vw, 12px) clamp(16px, 4vw, 20px); font-size: clamp(0.875rem, 2.5vw, 1rem); min-height: 44px;">Send</button>
        </div>
    </div>
    <script src="/static/local-ui.js"></script>
</body>
</html>
    '''
    return HTMLResponse(content=html_content)

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    logger.error(f"Request validation error: {exc}")
    logger.error(f"Request body: {body.decode()}")
    logger.error(f"Request headers: {request.headers}")
    
    # Parse the request body to see the actual structure
    try:
        import json
        parsed_body = json.loads(body.decode())
        logger.error(f"Parsed request body: {json.dumps(parsed_body, indent=2)}")
    except:
        logger.error("Could not parse request body as JSON")
        
    return JSONResponse(
        status_code=422,
        content={"error": "Request validation failed", "details": exc.errors()}
    )

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